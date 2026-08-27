import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewAppointmentClient from "./NewAppointmentClient";

export const metadata: Metadata = { title: "New Appointment" };

export default async function NewAppointmentPage() {
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string | undefined;
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const [patients, doctors] = await Promise.all([
    prisma.patient.findMany({
      where: isSuperAdmin ? {} : { hospitalId },
      select: { id: true, firstName: true, lastName: true, mrn: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.doctor.findMany({
      where: isSuperAdmin ? {} : { hospitalId },
      select: {
        id: true,
        specialization: true,
        consultationFee: true,
        user: { select: { name: true } },
      },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  const serializedPatients = patients.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    mrn: p.mrn,
  }));

  const serializedDoctors = doctors.map((d) => ({
    id: d.id,
    name: d.user.name,
    specialization: d.specialization,
    fee: d.consultationFee,
  }));

  return <NewAppointmentClient patients={serializedPatients} doctors={serializedDoctors} />;
}
