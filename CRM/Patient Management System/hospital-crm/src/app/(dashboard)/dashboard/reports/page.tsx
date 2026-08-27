import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReportsClient from "./ReportsClient";
import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export const metadata: Metadata = { title: "Reports & Analytics" };

const DIAGNOSIS_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981", "#6b7280"];

export default async function ReportsPage() {
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string;
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { hospitalId };
  const invoiceWhere = isSuperAdmin ? {} : { hospitalId };

  const now = new Date();

  const monthlyRevenue = [];
  const patientGrowth = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const from = startOfMonth(monthDate);
    const to = endOfMonth(monthDate);
    const [revenue, expenses, newPatients, returningAppointments] = await Promise.all([
      prisma.invoice.aggregate({ where: { ...invoiceWhere, status: "PAID", paidAt: { gte: from, lte: to } }, _sum: { totalAmount: true } }),
      prisma.invoice.aggregate({ where: { ...invoiceWhere, status: "PAID", paidAt: { gte: from, lte: to } }, _sum: { taxAmount: true, discount: true } }),
      prisma.patient.count({ where: { ...where, registeredAt: { gte: from, lte: to } } }),
      prisma.appointment.count({ where: { ...where, scheduledAt: { gte: from, lte: to }, isFirstVisit: false } }),
    ]);
    const rev = revenue._sum.totalAmount ?? 0;
    const exp = (expenses._sum.taxAmount ?? 0) + (expenses._sum.discount ?? 0);
    monthlyRevenue.push({ month: format(monthDate, "MMM"), revenue: rev, expenses: exp, profit: rev - exp });
    patientGrowth.push({ month: format(monthDate, "MMM"), new: newPatients, returning: returningAppointments });
  }

  const newPatientsTotal = patientGrowth.reduce((s, m) => s + m.new, 0);
  const returningTotal = patientGrowth.reduce((s, m) => s + m.returning, 0);

  const doctors = await prisma.doctor.findMany({
    where: isSuperAdmin ? {} : { hospitalId },
    include: {
      user: { select: { name: true } },
      appointments: { select: { id: true, status: true, patientId: true } },
    },
  });

  const doctorPerformance = await Promise.all(
    doctors.map(async (doc) => {
      const uniquePatients = new Set(doc.appointments.map((a) => a.patientId)).size;
      const revenueAgg = await prisma.invoice.aggregate({
        where: {
          ...invoiceWhere,
          status: "PAID",
          patient: { appointments: { some: { doctorId: doc.id } } },
        },
        _sum: { totalAmount: true },
      });
      const completed = doc.appointments.filter((a) => a.status === "COMPLETED").length;
      const rating = doc.appointments.length > 0 ? Number((4 + (completed / doc.appointments.length)).toFixed(1)) : 0;
      return {
        doctor: doc.user.name,
        patients: uniquePatients,
        appointments: doc.appointments.length,
        revenue: revenueAgg._sum.totalAmount ?? 0,
        rating: Math.min(rating, 5),
      };
    })
  );

  const diagnosisRecords = await prisma.medicalRecord.findMany({
    where: isSuperAdmin ? {} : { patient: { hospitalId } },
    select: { diagnosis: true },
  });
  const diagnosisCounts: Record<string, number> = {};
  for (const rec of diagnosisRecords) {
    for (const d of rec.diagnosis) {
      diagnosisCounts[d] = (diagnosisCounts[d] ?? 0) + 1;
    }
  }
  const sortedDiagnoses = Object.entries(diagnosisCounts).sort((a, b) => b[1] - a[1]);
  const totalDiagnoses = sortedDiagnoses.reduce((sum, [, c]) => sum + c, 0);
  const topDiagnoses = sortedDiagnoses.slice(0, 5);
  const otherCount = sortedDiagnoses.slice(5).reduce((sum, [, c]) => sum + c, 0);
  const diagnosisBreakdown =
    totalDiagnoses > 0
      ? [
          ...topDiagnoses.map(([name, count], i) => ({
            name,
            value: Math.round((count / totalDiagnoses) * 100),
            color: DIAGNOSIS_COLORS[i % DIAGNOSIS_COLORS.length],
          })),
          ...(otherCount > 0
            ? [{ name: "Other", value: Math.round((otherCount / totalDiagnoses) * 100), color: "#6b7280" }]
            : []),
        ]
      : [];

  return (
    <ReportsClient
      monthlyRevenue={monthlyRevenue}
      patientGrowth={patientGrowth}
      newPatientsTotal={newPatientsTotal}
      returningTotal={returningTotal}
      doctorPerformance={doctorPerformance}
      diagnosisBreakdown={diagnosisBreakdown}
    />
  );
}
