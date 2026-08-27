import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const patientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).default("OTHER"),
  bloodGroup: z.enum(["A_POSITIVE","A_NEGATIVE","B_POSITIVE","B_NEGATIVE","AB_POSITIVE","AB_NEGATIVE","O_POSITIVE","O_NEGATIVE","UNKNOWN"]).default("UNKNOWN"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  currentMedications: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const where: any = {
      hospitalId: session.user?.hospitalId,
    };

    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { mrn: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          appointments: {
            orderBy: { scheduledAt: "desc" },
            take: 1,
          },
        },
        orderBy: { registeredAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);

    return NextResponse.json({ patients, total, page, limit });
  } catch (error) {
    console.error("[Patients GET]", error);
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
    const data = patientSchema.parse(body);

    // Get hospital slug for MRN
    const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
    if (!hospital) return NextResponse.json({ error: "Hospital not found" }, { status: 404 });

    // Generate unique MRN
    let mrn: string;
    let attempts = 0;
    do {
      const prefix = hospital.slug.slice(0, 3).toUpperCase();
      const ts = Date.now().toString().slice(-6);
      const rand = Math.floor(Math.random() * 100).toString().padStart(2, "0");
      mrn = `${prefix}${ts}${rand}`;
      const exists = await prisma.patient.findUnique({ where: { mrn } });
      if (!exists) break;
      attempts++;
    } while (attempts < 5);

    // Create patient user account if email provided
    let userId: string | undefined;
    if (data.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (!existingUser) {
        const tempPassword = `Patient@${Math.random().toString(36).slice(-6)}`;
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        const user = await prisma.user.create({
          data: {
            email: data.email,
            name: `${data.firstName} ${data.lastName}`,
            passwordHash,
            role: "PATIENT",
            hospitalId,
          },
        });
        userId = user.id;
      }
    }

    const patient = await prisma.patient.create({
      data: {
        ...data,
        mrn,
        hospitalId,
        userId,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id,
        hospitalId,
        action: "CREATE",
        entity: "Patient",
        entityId: patient.id,
        newValues: { mrn, name: `${data.firstName} ${data.lastName}` },
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("[Patients POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
