import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { subMonths, startOfMonth, endOfMonth, startOfDay, endOfDay, format, subDays, formatDistanceToNow } from "date-fns";

export const metadata: Metadata = {
  title: "Dashboard",
};

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#10b981",
  SCHEDULED: "#3b82f6",
  CONFIRMED: "#14b8a6",
  CHECKED_IN: "#a78bfa",
  CANCELLED: "#ef4444",
  NO_SHOW: "#f59e0b",
};

export default async function DashboardPage() {
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string;

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekAgo = subDays(now, 7);

  const [
    totalPatients,
    newPatientsThisWeek,
    appointmentsTodayCount,
    completedTodayCount,
    followUpsPending,
    paidInvoicesThisMonth,
    pendingInvoices,
    todayAppointments,
    recentAuditLogs,
    statusCounts,
  ] = await Promise.all([
    prisma.patient.count({ where: { hospitalId } }),
    prisma.patient.count({ where: { hospitalId, registeredAt: { gte: weekAgo } } }),
    prisma.appointment.count({ where: { hospitalId, scheduledAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.appointment.count({ where: { hospitalId, scheduledAt: { gte: todayStart, lte: todayEnd }, status: "COMPLETED" } }),
    prisma.followUp.count({ where: { status: "PENDING", patient: { hospitalId } } }),
    prisma.invoice.aggregate({
      where: { hospitalId, status: "PAID", paidAt: { gte: startOfMonth(now), lte: endOfMonth(now) } },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.aggregate({
      where: { hospitalId, status: { in: ["SENT", "OVERDUE"] } },
      _sum: { totalAmount: true },
    }),
    prisma.appointment.findMany({
      where: { hospitalId, scheduledAt: { gte: todayStart, lte: todayEnd } },
      include: { patient: { select: { firstName: true, lastName: true } }, doctor: { include: { user: { select: { name: true } } } } },
      orderBy: { scheduledAt: "asc" },
      take: 8,
    }),
    prisma.auditLog.findMany({
      where: { hospitalId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.appointment.groupBy({
      by: ["status"],
      where: { hospitalId },
      _count: true,
    }),
  ]);

  // Last 6 months trend
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const from = startOfMonth(monthDate);
    const to = endOfMonth(monthDate);
    const [revenue, patients, appointments] = await Promise.all([
      prisma.invoice.aggregate({ where: { hospitalId, status: "PAID", paidAt: { gte: from, lte: to } }, _sum: { totalAmount: true } }),
      prisma.patient.count({ where: { hospitalId, registeredAt: { gte: from, lte: to } } }),
      prisma.appointment.count({ where: { hospitalId, scheduledAt: { gte: from, lte: to } } }),
    ]);
    monthlyData.push({
      month: format(monthDate, "MMM"),
      revenue: revenue._sum.totalAmount ?? 0,
      patients,
      appointments,
    });
  }

  const appointmentTypeData = statusCounts.map((s) => ({
    name: s.status.replace("_", " "),
    value: s._count,
    color: STATUS_COLORS[s.status] ?? "#64748b",
  }));

  const entityIcons: Record<string, string> = {
    Patient: "👤",
    Appointment: "📅",
    Invoice: "💳",
    LabReport: "🧪",
    Prescription: "💊",
    MedicalRecord: "📋",
    FollowUp: "🤖",
  };

  const recentActivity = recentAuditLogs.map((log) => ({
    icon: entityIcons[log.entity] ?? "🔔",
    text: `${log.action.charAt(0)}${log.action.slice(1).toLowerCase()} ${log.entity.replace(/([A-Z])/g, " $1").trim()}`,
    time: formatDistanceToNow(log.createdAt, { addSuffix: true }),
  }));

  const kpiCards = [
    {
      label: "Total Patients",
      value: totalPatients.toLocaleString("en-IN"),
      change: `+${newPatientsThisWeek}`,
      positive: true,
      icon: "👥",
      color: "teal",
      iconBg: "rgba(20,184,166,0.12)",
      iconColor: "#14b8a6",
      sub: `${newPatientsThisWeek} new this week`,
    },
    {
      label: "Appointments Today",
      value: String(appointmentsTodayCount),
      change: `${completedTodayCount} completed`,
      positive: true,
      icon: "📅",
      color: "cyan",
      iconBg: "rgba(8,145,178,0.12)",
      iconColor: "#38bdf8",
      sub: `${completedTodayCount} completed · ${appointmentsTodayCount - completedTodayCount} remaining`,
    },
    {
      label: "Monthly Revenue",
      value: `₹${((paidInvoicesThisMonth._sum.totalAmount ?? 0) / 100000).toFixed(2)}L`,
      change: "This month",
      positive: true,
      icon: "💰",
      color: "violet",
      iconBg: "rgba(139,92,246,0.12)",
      iconColor: "#a78bfa",
      sub: `₹${(pendingInvoices._sum.totalAmount ?? 0).toLocaleString("en-IN")} pending invoices`,
    },
    {
      label: "Follow-Ups Pending",
      value: String(followUpsPending),
      change: "Pending",
      positive: followUpsPending === 0,
      icon: "🤖",
      color: "amber",
      iconBg: "rgba(245,158,11,0.12)",
      iconColor: "#fbbf24",
      sub: "AI-generated follow-ups",
    },
  ];

  return (
    <DashboardClient
      kpiCards={kpiCards}
      monthlyData={monthlyData}
      appointmentTypeData={appointmentTypeData}
      todayAppointments={todayAppointments.map((a) => ({
        id: a.id,
        time: format(new Date(a.scheduledAt), "h:mm a"),
        patient: `${a.patient.firstName} ${a.patient.lastName}`,
        doctor: a.doctor.user.name,
        type: a.type,
        status: a.status,
      }))}
      recentActivity={recentActivity}
    />
  );
}
