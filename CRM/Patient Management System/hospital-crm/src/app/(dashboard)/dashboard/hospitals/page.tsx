import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import HospitalsClient from "./HospitalsClient";

export const metadata: Metadata = { title: "Hospitals — Super Admin" };

export default async function HospitalsPage() {
  const hospitals = await prisma.hospital.findMany({
    include: {
      subscription: true,
      _count: { select: { patients: true, doctors: true, appointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = hospitals.map((h) => ({
    id: h.id,
    name: h.name,
    slug: h.slug,
    city: h.city,
    subscriptionPlan: h.subscriptionPlan,
    isActive: h.isActive,
    createdAt: h.createdAt.toISOString(),
    patients: h._count.patients,
    doctors: h._count.doctors,
    subscriptionStatus: h.subscription?.status ?? "TRIALING",
  }));

  return <HospitalsClient hospitals={serialized} />;
}
