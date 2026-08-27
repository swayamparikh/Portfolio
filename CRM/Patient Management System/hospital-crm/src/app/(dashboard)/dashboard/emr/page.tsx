import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EMRClient from "./EMRClient";

export const metadata: Metadata = { title: "Medical Records" };

export default async function EMRPage() {
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string;

  const [records, patients, doctors] = await Promise.all([
    prisma.medicalRecord.findMany({
      where: { patient: { hospitalId } },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true } },
        doctor: { select: { user: { select: { name: true } }, specialization: true } },
        prescriptions: true,
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
    prisma.doctor.findMany({
      where: { hospitalId },
      select: { id: true, specialization: true, user: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const serialized = records.map((r) => ({
    id: r.id,
    patient: `${r.patient.firstName} ${r.patient.lastName}`,
    mrn: r.patient.mrn,
    patientId: r.patientId,
    doctor: r.doctor.user.name,
    diagnosis: r.diagnosis,
    vitals: (r.vitals as any) ?? {},
    consultationNotes: r.consultationNotes,
    treatmentPlan: r.treatmentPlan,
    createdAt: r.createdAt.toISOString(),
    followUpDate: r.followUpDate ? r.followUpDate.toISOString() : null,
    prescriptionCount: r.prescriptions.length,
  }));

  return (
    <EMRClient
      records={serialized}
      patients={patients}
      doctors={doctors.map((d) => ({ id: d.id, name: d.user.name, specialization: d.specialization }))}
    />
  );
}
