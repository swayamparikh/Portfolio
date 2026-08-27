import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  duration: z.string().min(1),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  patientId: z.string(),
  medications: z.array(medicationSchema).min(1),
  instructions: z.string().optional(),
  validUntil: z.string().optional(),
  medicalRecordId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospitalId = session.user?.hospitalId;

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const search = searchParams.get("search") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where: any = {
      patient: { hospitalId },
    };

    if (patientId) where.patientId = patientId;

    if (search) {
      where.OR = [
        { patient: { firstName: { contains: search, mode: "insensitive" } } },
        { patient: { lastName: { contains: search, mode: "insensitive" } } },
        { patient: { mrn: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true } },
        },
        orderBy: { issuedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.prescription.count({ where }),
    ]);

    return NextResponse.json({ prescriptions, total, page, limit });
  } catch (error) {
    console.error("[Prescriptions GET]", error);
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
    const data = prescriptionSchema.parse(body);

    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, hospitalId } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const prescription = await prisma.prescription.create({
      data: {
        patientId: data.patientId,
        medicalRecordId: data.medicalRecordId,
        medications: data.medications,
        instructions: data.instructions,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user?.id,
        hospitalId,
        action: "CREATE",
        entity: "Prescription",
        entityId: prescription.id,
        newValues: { patientId: data.patientId, medications: data.medications },
      },
    });

    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("[Prescriptions POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
