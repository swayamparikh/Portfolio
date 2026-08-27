import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const hospitalSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  licenseNumber: z.string().optional(),
  subscriptionPlan: z
    .enum(["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"])
    .default("FREE"),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const hospitals = await prisma.hospital.findMany({
      include: {
        subscription: true,
        _count: { select: { patients: true, users: true, appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(hospitals);
  } catch (error) {
    console.error("[Hospitals GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = hospitalSchema.parse(body);

    const existingSlug = await prisma.hospital.findUnique({ where: { slug: data.slug } });
    if (existingSlug) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }

    const hospital = await prisma.hospital.create({
      data: {
        name: data.name,
        slug: data.slug,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        website: data.website || undefined,
        licenseNumber: data.licenseNumber || undefined,
        subscriptionPlan: data.subscriptionPlan,
        subscription: {
          create: {
            plan: data.subscriptionPlan,
            status: "TRIALING",
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: { subscription: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user?.id,
        hospitalId: hospital.id,
        action: "CREATE",
        entity: "Hospital",
        entityId: hospital.id,
        newValues: { name: data.name, slug: data.slug, subscriptionPlan: data.subscriptionPlan },
      },
    });

    return NextResponse.json(hospital, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("[Hospitals POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
