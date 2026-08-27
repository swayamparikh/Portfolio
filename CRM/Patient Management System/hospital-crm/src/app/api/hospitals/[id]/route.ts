import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  licenseNumber: z.string().optional(),
  subscriptionPlan: z.enum(["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const role = session.user?.role;
    const isSuperAdmin = role === "SUPER_ADMIN";
    const isOwnHospitalAdmin = role === "HOSPITAL_ADMIN" && session.user?.hospitalId === id;

    if (!isSuperAdmin && !isOwnHospitalAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    // Only SUPER_ADMIN can change subscription plan or active status
    if (!isSuperAdmin) {
      delete data.subscriptionPlan;
      delete data.isActive;
    }

    const existing = await prisma.hospital.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Hospital not found" }, { status: 404 });

    const hospital = await prisma.hospital.update({
      where: { id },
      data: {
        ...data,
        email: data.email === "" ? undefined : data.email,
      },
      include: { subscription: true },
    });

    if (data.subscriptionPlan && data.subscriptionPlan !== existing.subscriptionPlan) {
      await prisma.subscription.upsert({
        where: { hospitalId: id },
        update: { plan: data.subscriptionPlan },
        create: { hospitalId: id, plan: data.subscriptionPlan, status: "TRIALING" },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user?.id,
        hospitalId: id,
        action: "UPDATE",
        entity: "Hospital",
        entityId: id,
        oldValues: {
          name: existing.name,
          isActive: existing.isActive,
          subscriptionPlan: existing.subscriptionPlan,
        },
        newValues: data,
      },
    });

    return NextResponse.json(hospital);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("[Hospitals PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
