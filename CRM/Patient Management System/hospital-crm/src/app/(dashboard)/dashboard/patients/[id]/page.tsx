import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PatientProfileClient from "./PatientProfileClient";

export const metadata: Metadata = { title: "Patient Profile" };

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string | undefined;
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const patient = await prisma.patient.findFirst({
    where: isSuperAdmin ? { id } : { id, hospitalId },
  });

  if (!patient) notFound();

  const serialized = {
    id: patient.id,
    mrn: patient.mrn,
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString() : null,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup,
    phone: patient.phone,
    email: patient.email,
    address: patient.address,
    emergencyName: patient.emergencyName,
    emergencyPhone: patient.emergencyPhone,
    emergencyRelation: patient.emergencyRelation,
    allergies: patient.allergies,
    currentMedications: patient.currentMedications,
    chronicConditions: patient.chronicConditions,
    insuranceProvider: patient.insuranceProvider,
    insuranceNumber: patient.insuranceNumber,
    isActive: patient.isActive,
  };

  return <PatientProfileClient patient={serialized} />;
}
