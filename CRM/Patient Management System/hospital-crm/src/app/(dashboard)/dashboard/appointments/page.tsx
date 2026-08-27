import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppointmentsClient from "./AppointmentsClient";

export const metadata: Metadata = { title: "Appointments" };

export default async function AppointmentsPage() {
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string | undefined;
  const role = session?.user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  const where: Record<string, unknown> = isSuperAdmin ? {} : { hospitalId };

  if (role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({ where: { userId: session?.user?.id } });
    if (doctor) where.doctorId = doctor.id;
  } else if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId: session?.user?.id } });
    if (patient) where.patientId = patient.id;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { firstName: true, lastName: true, mrn: true, phone: true } },
      doctor: { select: { user: { select: { name: true } }, specialization: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const serialized = appointments.map((a) => ({
    id: a.id,
    patient: `${a.patient.firstName} ${a.patient.lastName}`,
    doctor: a.doctor.user.name,
    scheduledAt: a.scheduledAt.toISOString(),
    type: a.type,
    status: a.status,
    duration: a.duration,
  }));

  return <AppointmentsClient appointments={serialized} />;
}
