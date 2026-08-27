import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addDays, startOfMonth } from "date-fns";
import PrescriptionsClient from "./PrescriptionsClient";

export const metadata: Metadata = { title: "Prescriptions" };

export default async function PrescriptionsPage() {
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string;
  const now = new Date();

  // Note: Prescription has no doctorId field in the schema — it is only
  // linked to a patient (and optionally a medicalRecordId), so scoping is by hospital only.
  const where: any = { patient: { hospitalId } };

  const [prescriptions, patients, activeCount, expiringCount, monthCount] = await Promise.all([
    prisma.prescription.findMany({
      where,
      include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
      orderBy: { issuedAt: "desc" },
      take: 100,
    }),
    prisma.patient.findMany({
      where: { hospitalId, isActive: true },
      select: { id: true, firstName: true, lastName: true, mrn: true },
      orderBy: { firstName: "asc" },
      take: 200,
    }),
    prisma.prescription.count({
      where: { patient: { hospitalId }, OR: [{ validUntil: null }, { validUntil: { gte: now } }] },
    }),
    prisma.prescription.count({
      where: { patient: { hospitalId }, validUntil: { gte: now, lte: addDays(now, 7) } },
    }),
    prisma.prescription.count({
      where: { patient: { hospitalId }, issuedAt: { gte: startOfMonth(now) } },
    }),
  ]);

  const serialized = prescriptions.map((rx) => {
    const validUntil = rx.validUntil ? rx.validUntil.toISOString() : null;
    const status: "ACTIVE" | "EXPIRED" = rx.validUntil && rx.validUntil < now ? "EXPIRED" : "ACTIVE";
    return {
      id: rx.id,
      patient: `${rx.patient.firstName} ${rx.patient.lastName}`,
      mrn: rx.patient.mrn,
      patientId: rx.patientId,
      medications: (rx.medications as any[]) ?? [],
      instructions: rx.instructions,
      issuedAt: rx.issuedAt.toISOString(),
      validUntil,
      status,
    };
  });

  const kpis = [
    { label: "Active Prescriptions", value: String(activeCount), icon: "💊", color: "teal" },
    { label: "Expiring This Week", value: String(expiringCount), icon: "⚠️", color: "amber" },
    { label: "Total This Month", value: String(monthCount), icon: "📋", color: "violet" },
  ];

  return <PrescriptionsClient prescriptions={serialized} patients={patients} kpis={kpis} />;
}
