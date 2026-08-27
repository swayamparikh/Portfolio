import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StaffClient from "./StaffClient";

export const metadata: Metadata = { title: "Staff Management" };

export default async function StaffPage() {
  const session = await auth();
  const hospitalId = session?.user?.hospitalId as string | undefined;
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const where = isSuperAdmin ? {} : { hospitalId };

  const [staffProfiles, doctors, departments] = await Promise.all([
    prisma.staffProfile.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true, avatarUrl: true, isActive: true, role: true } },
        department: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.doctor.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true, avatarUrl: true, isActive: true } },
        department: { select: { name: true } },
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.department.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const staffRows = staffProfiles.map((s) => ({
    id: s.id,
    name: s.user.name,
    role: s.user.role === "HOSPITAL_ADMIN" ? "Admin" : "Receptionist",
    department: s.department?.name ?? "—",
    specialization: s.designation,
    shift: s.shift ?? "—",
    joinedAt: (s.joinedAt ?? s.createdAt).toISOString(),
    phone: s.user.phone,
    email: s.user.email,
    patients: 0,
    isAvailable: s.user.isActive,
  }));

  const doctorRows = doctors.map((d) => ({
    id: d.id,
    name: d.user.name,
    role: "Doctor",
    department: d.department?.name ?? "—",
    specialization: d.specialization,
    shift: "—",
    joinedAt: d.createdAt.toISOString(),
    phone: d.user.phone,
    email: d.user.email,
    patients: d._count.appointments,
    isAvailable: d.isAvailable && d.user.isActive,
  }));

  const staff = [...doctorRows, ...staffRows];

  return <StaffClient staff={staff} departments={departments} />;
}
