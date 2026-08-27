import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth } from "date-fns";
import LabReportsClient from "./LabReportsClient";

export const metadata: Metadata = { title: "Lab Reports" };

export default async function LabReportsPage() {
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string;
  const now = new Date();

  const [labReports, patients, reportsToday, reportsThisMonth] = await Promise.all([
    prisma.labReport.findMany({
      where: { patient: { hospitalId } },
      include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
      orderBy: { reportedAt: "desc" },
      take: 100,
    }),
    prisma.patient.findMany({
      where: { hospitalId, isActive: true },
      select: { id: true, firstName: true, lastName: true, mrn: true },
      orderBy: { firstName: "asc" },
      take: 200,
    }),
    prisma.labReport.count({
      where: { patient: { hospitalId }, reportedAt: { gte: startOfDay(now), lte: endOfDay(now) } },
    }),
    prisma.labReport.findMany({
      where: { patient: { hospitalId }, reportedAt: { gte: startOfMonth(now) } },
      select: { results: true },
    }),
  ]);
  const completedThisMonth = reportsThisMonth.filter(
    (r) => Array.isArray(r.results) && (r.results as any[]).length > 0
  ).length;

  const serialized = labReports.map((r) => {
    const results = (r.results as any[]) ?? [];
    const status: "COMPLETED" | "PENDING" = results.length > 0 ? "COMPLETED" : "PENDING";
    const hasFlag = results.some((res) => res.flag);
    const findings: "Normal" | "Abnormal" | "Pending" = results.length === 0 ? "Pending" : hasFlag ? "Abnormal" : "Normal";
    return {
      id: r.id,
      patient: `${r.patient.firstName} ${r.patient.lastName}`,
      mrn: r.patient.mrn,
      patientId: r.patientId,
      reportType: r.reportType,
      testName: r.testName,
      results,
      fileUrl: r.fileUrl,
      notes: r.notes,
      reportedAt: r.reportedAt.toISOString(),
      status,
      findings,
    };
  });

  const pendingCount = serialized.filter((r) => r.status === "PENDING").length;
  const criticalCount = serialized.reduce(
    (sum, r) => sum + r.results.filter((res: any) => res.flag === "H" || res.flag === "L").length,
    0
  );

  const kpis = [
    { label: "Reports Today", value: String(reportsToday), icon: "🧪", color: "teal" },
    { label: "Pending Review", value: String(pendingCount), icon: "⏳", color: "amber" },
    { label: "Flagged Results", value: String(criticalCount), icon: "🚨", color: "cyan" },
    { label: "Completed MTD", value: String(completedThisMonth), icon: "✅", color: "violet" },
  ];

  return <LabReportsClient labReports={serialized} patients={patients} kpis={kpis} />;
}
