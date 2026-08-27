import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const staffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  designation: z.string().min(1),
  departmentId: z.string().optional(),
  shift: z.enum(["Morning", "Evening", "Night"]).optional(),
  role: z.enum(["HOSPITAL_ADMIN", "RECEPTIONIST"]).default("RECEPTIONIST"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospitalId = session.user?.hospitalId;
    if (!hospitalId) return NextResponse.json({ error: "No hospital associated" }, { status: 400 });

    const staff = await prisma.staffProfile.findMany({
      where: { hospitalId },
      include: {
        user: { select: { name: true, email: true, phone: true, avatarUrl: true, isActive: true } },
        department: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[Staff GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospitalId = session.user?.hospitalId;
    if (!hospitalId) return NextResponse.json({ error: "No hospital associated" }, { status: 400 });

    const body = await req.json();
    const data = staffSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email address already exists" }, { status: 400 });
    }

    const tempPassword = `Staff@${Math.random().toString(36).slice(-8)}`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          passwordHash,
          role: data.role,
          hospitalId,
          isActive: true,
        },
      });

      const staffProfile = await tx.staffProfile.create({
        data: {
          userId: user.id,
          hospitalId,
          departmentId: data.departmentId,
          designation: data.designation,
          shift: data.shift,
          joinedAt: new Date(),
        },
        include: {
          user: { select: { name: true, email: true, phone: true, avatarUrl: true, isActive: true } },
          department: { select: { name: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user?.id,
          hospitalId,
          action: "CREATE",
          entity: "StaffProfile",
          entityId: staffProfile.id,
          newValues: { name: data.name, email: data.email, designation: data.designation, role: data.role },
        },
      });

      return staffProfile;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("[Staff POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
