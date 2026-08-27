import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AnalyticsClient from "./AnalyticsClient";
import { subMonths, startOfMonth, endOfMonth, format, startOfYear } from "date-fns";

export const metadata: Metadata = { title: "Analytics" };

const DIAGNOSIS_COLORS = ["#14b8a6", "#38bdf8", "#a78bfa", "#fbbf24", "#fb923c", "#6b7280"];

export default async function AnalyticsPage() {
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string;
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { hospitalId };
  const invoiceWhere = isSuperAdmin ? {} : { hospitalId };

  const now = new Date();
  const yearStart = startOfYear(now);

  const [
    revenueYTD,
    totalPatients,
    patientsYearStart,
    completedAppointments,
    totalAppointments,
    statusCounts,
    doctors,
    diagnosisRecords,
  ] = await Promise.all([
    prisma.invoice.aggregate({ where: { ...invoiceWhere, status: "PAID", paidAt: { gte: yearStart } }, _sum: { totalAmount: true } }),
    prisma.patient.count({ where }),
    prisma.patient.count({ where: { ...where, registeredAt: { lt: yearStart } } }),
    prisma.appointment.count({ where: { ...where, status: "COMPLETED" } }),
    prisma.appointment.count({ where }),
    prisma.appointment.groupBy({ by: ["status"], where, _count: true }),
    prisma.doctor.findMany({
      where: isSuperAdmin ? {} : { hospitalId },
      include: {
        user: { select: { name: true } },
        appointments: { select: { status: true } },
      },
    }),
    prisma.medicalRecord.findMany({
      where: isSuperAdmin ? {} : { patient: { hospitalId } },
      select: { diagnosis: true },
    }),
  ]);

  // Monthly revenue vs patients for last 6 months
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const from = startOfMonth(monthDate);
    const to = endOfMonth(monthDate);
    const [revenue, expenses, patients] = await Promise.all([
      prisma.invoice.aggregate({ where: { ...invoiceWhere, status: "PAID", paidAt: { gte: from, lte: to } }, _sum: { totalAmount: true } }),
      prisma.invoice.aggregate({ where: { ...invoiceWhere, status: "PAID", paidAt: { gte: from, lte: to } }, _sum: { taxAmount: true, discount: true } }),
      prisma.patient.count({ where: { ...where, registeredAt: { gte: from, lte: to } } }),
    ]);
    const rev = revenue._sum.totalAmount ?? 0;
    const exp = (expenses._sum.taxAmount ?? 0) + (expenses._sum.discount ?? 0);
    monthlyRevenue.push({
      month: format(monthDate, "MMM"),
      revenue: rev,
      expenses: exp,
      profit: rev - exp,
      patients,
    });
  }

  // Patient flow by hour (all-time appointment scheduledAt hour distribution)
  const appointmentsWithHour = await prisma.appointment.findMany({
    where,
    select: { scheduledAt: true },
  });
  const hourCounts: Record<number, number> = {};
  for (const a of appointmentsWithHour) {
    const h = new Date(a.scheduledAt).getHours();
    hourCounts[h] = (hourCounts[h] ?? 0) + 1;
  }
  const patientFlowByHour = Array.from({ length: 11 }, (_, idx) => {
    const hour24 = idx + 8; // 8am..6pm
    const label = hour24 === 12 ? "12pm" : hour24 > 12 ? `${hour24 - 12}pm` : `${hour24}am`;
    return { hour: label, checkins: hourCounts[hour24] ?? 0 };
  });

  // Diagnosis distribution
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
  const diagnosisDistribution =
    totalDiagnoses > 0
      ? [
          ...topDiagnoses.map(([name, count], i) => ({
            name,
            value: Math.round((count / totalDiagnoses) * 100),
            color: DIAGNOSIS_COLORS[i % DIAGNOSIS_COLORS.length],
          })),
          ...(otherCount > 0
            ? [{ name: "Others", value: Math.round((otherCount / totalDiagnoses) * 100), color: "#6b7280" }]
            : []),
        ]
      : [];

  // Department performance
  const departments = await prisma.department.findMany({
    where: isSuperAdmin ? {} : { hospitalId },
    include: {
      doctors: {
        include: {
          appointments: { select: { status: true } },
        },
      },
    },
  });
  const departmentData = await Promise.all(
    departments.map(async (dept) => {
      const doctorIds = dept.doctors.map((d) => d.id);
      const patientCount = doctorIds.length
        ? await prisma.appointment.findMany({
            where: { doctorId: { in: doctorIds } },
            select: { patientId: true },
            distinct: ["patientId"],
          })
        : [];
      const revenueAgg = await prisma.invoice.aggregate({
        where: {
          ...invoiceWhere,
          status: "PAID",
          patient: { appointments: { some: { doctorId: { in: doctorIds } } } },
        },
        _sum: { totalAmount: true },
      });
      const totalAppts = dept.doctors.reduce((sum, d) => sum + d.appointments.length, 0);
      const completedAppts = dept.doctors.reduce(
        (sum, d) => sum + d.appointments.filter((a) => a.status === "COMPLETED").length,
        0
      );
      const satisfaction = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0;
      return {
        department: dept.name,
        patients: patientCount.length,
        revenue: revenueAgg._sum.totalAmount ?? 0,
        satisfaction,
      };
    })
  );

  // Doctor performance
  const doctorPerformance = await Promise.all(
    doctors.map(async (doc) => {
      const consultations = doc.appointments.length;
      const completed = doc.appointments.filter((a) => a.status === "COMPLETED").length;
      const revenueAgg = await prisma.invoice.aggregate({
        where: {
          ...invoiceWhere,
          status: "PAID",
          patient: { appointments: { some: { doctorId: doc.id } } },
        },
        _sum: { totalAmount: true },
      });
      const followUpCount = await prisma.followUp.count({
        where: { patient: { appointments: { some: { doctorId: doc.id } } }, status: "SENT" },
      });
      return {
        doctor: doc.user.name,
        consultations,
        satisfaction: consultations > 0 ? Math.round((completed / consultations) * 100) : 0,
        followups: followUpCount,
        revenue: revenueAgg._sum.totalAmount ?? 0,
      };
    })
  );

  const patientRetention =
    totalPatients > 0 ? Math.round((patientsYearStart / totalPatients) * 100) : 0;
  const appointmentAdherence =
    totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;
  const followUpsSent = await prisma.followUp.count({
    where: { status: "SENT", patient: isSuperAdmin ? {} : { hospitalId } },
  });
  const followUpsTotal = await prisma.followUp.count({
    where: { patient: isSuperAdmin ? {} : { hospitalId } },
  });
  const followUpRate = followUpsTotal > 0 ? Math.round((followUpsSent / followUpsTotal) * 100) : 0;

  const kpis = [
    {
      label: "Total Revenue (YTD)",
      value: `₹${((revenueYTD._sum.totalAmount ?? 0) / 100000).toFixed(2)}L`,
      change: "Year to date",
      positive: true,
      icon: "💰",
      color: "teal",
    },
    {
      label: "Patient Retention Rate",
      value: `${patientRetention}%`,
      change: "Since start of year",
      positive: patientRetention >= 50,
      icon: "🔄",
      color: "cyan",
    },
    {
      label: "Appointment Adherence",
      value: `${appointmentAdherence}%`,
      change: `${completedAppointments}/${totalAppointments} completed`,
      positive: appointmentAdherence >= 50,
      icon: "⏱️",
      color: "violet",
    },
    {
      label: "Follow-Up Rate",
      value: `${followUpRate}%`,
      change: `${followUpsSent}/${followUpsTotal} sent`,
      positive: followUpRate >= 50,
      icon: "⭐",
      color: "amber",
    },
  ];

  const radarData = [
    { metric: "Patient Retention", value: patientRetention },
    { metric: "Appointment Adherence", value: appointmentAdherence },
    { metric: "Follow-Up Rate", value: followUpRate },
    {
      metric: "Avg Dept Satisfaction",
      value: departmentData.length
        ? Math.round(departmentData.reduce((s, d) => s + d.satisfaction, 0) / departmentData.length)
        : 0,
    },
  ];

  return (
    <AnalyticsClient
      kpis={kpis}
      monthlyRevenue={monthlyRevenue}
      departmentData={departmentData}
      patientFlowByHour={patientFlowByHour}
      diagnosisDistribution={diagnosisDistribution}
      doctorPerformance={doctorPerformance}
      radarData={radarData}
    />
  );
}
