import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AuditLogsClient from "./AuditLogsClient";
import { startOfDay, endOfDay } from "date-fns";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AuditLogsPage() {
  const session = await auth();
  const role = session?.user?.role;
  const hospitalId = session?.user?.hospitalId as string | undefined;
  const isAdmin = role === "SUPER_ADMIN" || role === "HOSPITAL_ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";

  if (!isAdmin) {
    return <AuditLogsClient logs={[]} eventsToday={0} failedLogins={0} exports={0} activeSessions={0} forbidden />;
  }

  const where = isSuperAdmin ? {} : { hospitalId };
  const now = new Date();

  const [logs, eventsToday, failedLogins, exportsCount, activeSessions] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.auditLog.count({ where: { ...where, createdAt: { gte: startOfDay(now), lte: endOfDay(now) } } }),
    prisma.auditLog.count({ where: { ...where, action: "LOGIN_FAIL", createdAt: { gte: startOfDay(now), lte: endOfDay(now) } } }),
    prisma.auditLog.count({ where: { ...where, action: "EXPORT", createdAt: { gte: startOfDay(now), lte: endOfDay(now) } } }),
    prisma.session.count({
      where: {
        expiresAt: { gte: now },
        ...(isSuperAdmin ? {} : { user: { hospitalId } }),
      },
    }),
  ]);

  const serialized = logs.map((log) => ({
    id: log.id,
    timestamp: log.createdAt.toISOString(),
    user: log.user?.name ?? "System",
    role: log.user?.role ?? "SYSTEM",
    action: log.action,
    resource: log.entity,
    details: [log.entityId ? `ID: ${log.entityId}` : null].filter(Boolean).join(" · ") || log.entity,
    ip: log.ipAddress ?? "—",
    status: log.action.includes("FAIL") ? "FAILED" : "SUCCESS",
  }));

  return (
    <AuditLogsClient
      logs={serialized}
      eventsToday={eventsToday}
      failedLogins={failedLogins}
      exports={exportsCount}
      activeSessions={activeSessions}
    />
  );
}
