import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FollowUpsClient from "./FollowUpsClient";
import { startOfMonth, endOfMonth } from "date-fns";

export const metadata: Metadata = { title: "AI Follow-Ups" };

export default async function FollowUpsPage() {
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string;
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const patientWhere = isSuperAdmin ? {} : { hospitalId };

  const now = new Date();

  const [followUps, total, sentThisMonth, pendingCount, sentCount] = await Promise.all([
    prisma.followUp.findMany({
      where: { patient: patientWhere },
      include: { patient: { select: { firstName: true, lastName: true } } },
      orderBy: { scheduledAt: "desc" },
      take: 100,
    }),
    prisma.followUp.count({ where: { patient: patientWhere } }),
    prisma.followUp.count({
      where: { patient: patientWhere, status: "SENT", sentAt: { gte: startOfMonth(now), lte: endOfMonth(now) } },
    }),
    prisma.followUp.count({ where: { patient: patientWhere, status: "PENDING" } }),
    prisma.followUp.count({ where: { patient: patientWhere, status: "SENT" } }),
  ]);

  const responseRate = total > 0 ? Math.round((sentCount / total) * 100) : 0;

  // Patients without any follow-ups scheduled, who have a completed appointment (candidates for generating follow-ups)
  const patientsNeedingFollowUp = await prisma.patient.findMany({
    where: {
      ...patientWhere,
      followUps: { none: {} },
      appointments: { some: { status: "COMPLETED" } },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      appointments: {
        where: { status: "COMPLETED" },
        orderBy: { scheduledAt: "desc" },
        take: 1,
        select: { id: true, scheduledAt: true },
      },
    },
    take: 20,
  });

  return (
    <FollowUpsClient
      followUps={followUps.map((f) => ({
        id: f.id,
        patient: `${f.patient.firstName} ${f.patient.lastName}`,
        day: f.dayOffset,
        scheduledAt: f.scheduledAt.toISOString(),
        status: f.status,
        channel: f.channel,
        message: f.message,
        sentAt: f.sentAt ? f.sentAt.toISOString() : null,
      }))}
      stats={{
        total,
        sentThisMonth,
        pending: pendingCount,
        responseRate,
      }}
      candidates={patientsNeedingFollowUp.map((p) => ({
        patientId: p.id,
        patient: `${p.firstName} ${p.lastName}`,
        appointmentId: p.appointments[0]?.id ?? null,
      }))}
    />
  );
}
