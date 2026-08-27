import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import BillingClient from "./BillingClient";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [invoices, patients, revenueThisMonth, outstanding, overdue, invoicesThisMonth, paidThisMonth] =
    await Promise.all([
      prisma.invoice.findMany({
        where: { hospitalId },
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true } },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.patient.findMany({
        where: { hospitalId, isActive: true },
        select: { id: true, firstName: true, lastName: true, mrn: true },
        orderBy: { firstName: "asc" },
        take: 200,
      }),
      prisma.invoice.aggregate({
        where: { hospitalId, status: "PAID", paidAt: { gte: monthStart, lte: monthEnd } },
        _sum: { totalAmount: true },
      }),
      prisma.invoice.aggregate({
        where: { hospitalId, status: "SENT" },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: { hospitalId, status: "OVERDUE" },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.invoice.count({ where: { hospitalId, createdAt: { gte: monthStart, lte: monthEnd } } }),
      prisma.invoice.count({
        where: { hospitalId, status: "PAID", paidAt: { gte: monthStart, lte: monthEnd } },
      }),
    ]);

  const serialized = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    patient: `${inv.patient.firstName} ${inv.patient.lastName}`,
    mrn: inv.patient.mrn,
    patientId: inv.patientId,
    items: (inv.items as any[]) ?? [],
    subtotal: inv.subtotal,
    taxRate: inv.taxRate,
    taxAmount: inv.taxAmount,
    discount: inv.discount,
    totalAmount: inv.totalAmount,
    status: inv.status,
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    createdAt: inv.createdAt.toISOString(),
    paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
  }));

  const kpis = [
    {
      label: "Total Revenue (MTD)",
      value: revenueThisMonth._sum.totalAmount ?? 0,
      sub: "Paid invoices this month",
      icon: "💰",
      color: "teal",
    },
    {
      label: "Outstanding",
      value: outstanding._sum.totalAmount ?? 0,
      sub: `${outstanding._count} invoice${outstanding._count === 1 ? "" : "s"}`,
      icon: "📤",
      color: "amber",
    },
    {
      label: "Overdue",
      value: overdue._sum.totalAmount ?? 0,
      sub: `${overdue._count} invoice${overdue._count === 1 ? "" : "s"}`,
      icon: "⚠️",
      color: "cyan",
    },
    {
      label: "Paid This Month",
      value: paidThisMonth,
      sub: `of ${invoicesThisMonth} invoices`,
      icon: "✅",
      color: "violet",
      isCount: true,
    },
  ];

  return <BillingClient invoices={serialized} patients={patients} kpis={kpis} />;
}
