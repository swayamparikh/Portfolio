import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id as string;
  const hospitalId = session?.user?.hospitalId as string | null;
  const role = session?.user?.role as string;

  const [user, hospital] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true },
    }),
    hospitalId
      ? prisma.hospital.findUnique({
          where: { id: hospitalId },
          include: { subscription: true },
        })
      : null,
  ]);

  const canEditHospital = role === "SUPER_ADMIN" || role === "HOSPITAL_ADMIN";

  return (
    <SettingsClient
      user={
        user
          ? { id: user.id, name: user.name, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl, role: user.role }
          : null
      }
      hospital={
        hospital
          ? {
              id: hospital.id,
              name: hospital.name,
              licenseNumber: hospital.licenseNumber,
              phone: hospital.phone,
              email: hospital.email,
              address: hospital.address,
              subscriptionPlan: hospital.subscriptionPlan,
              subscriptionStatus: hospital.subscription?.status ?? "TRIALING",
            }
          : null
      }
      canEditHospital={canEditHospital}
    />
  );
}
