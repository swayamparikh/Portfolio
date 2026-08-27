import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PatientsClient from "./PatientsClient";

export const metadata: Metadata = { title: "Patients" };

export default async function PatientsPage() {
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string | undefined;
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const patients = await prisma.patient.findMany({
    where: isSuperAdmin ? {} : { hospitalId },
    include: {
      appointments: {
        orderBy: { scheduledAt: "desc" },
        take: 1,
      },
    },
    orderBy: { registeredAt: "desc" },
  });

  const serialized = patients.map((p) => ({
    id: p.id,
    mrn: p.mrn,
    firstName: p.firstName,
    lastName: p.lastName,
    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.toISOString() : null,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    phone: p.phone,
    email: p.email,
    chronicConditions: p.chronicConditions,
    isActive: p.isActive,
    lastVisit: p.appointments[0]?.scheduledAt.toISOString() ?? null,
  }));

  return <PatientsClient patients={serialized} />;
}
