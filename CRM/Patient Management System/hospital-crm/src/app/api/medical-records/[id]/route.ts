import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const vitalsSchema = z
  .object({
    bp: z.union([z.string(), z.number()]).optional(),
    pulse: z.union([z.string(), z.number()]).optional(),
    temp: z.union([z.string(), z.number()]).optional(),
    weight: z.union([z.string(), z.number()]).optional(),
    height: z.union([z.string(), z.number()]).optional(),
    bmi: z.union([z.string(), z.number()]).optional(),
    spo2: z.union([z.string(), z.number()]).optional(),
  })
  .partial()
  .optional();

const updateSchema = z.object({
  consultationNotes: z.string().optional(),
  diagnosis: z.array(z.string()).optional(),
  treatmentPlan: z.string().optional(),
  followUpDate: z.coerce.date().optional(),
  vitals: vitalsSchema,
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospitalId = session.user?.hospitalId;
    if (!hospitalId) return NextResponse.json({ error: "No hospital associated" }, { status: 400 });

    const { id } = await params;

    const record = await prisma.medicalRecord.findFirst({
      where: { id, patient: { hospitalId } },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        appointment: true,
        prescriptions: true,
      },
    });

    if (!record) return NextResponse.json({ error: "Medical record not found" }, { status: 404 });

    return NextResponse.json(record);
  } catch (error) {
    console.error("[Medical Record GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospitalId = session.user?.hospitalId;
    if (!hospitalId) return NextResponse.json({ error: "No hospital associated" }, { status: 400 });

    const { id } = await params;

    const existing = await prisma.medicalRecord.findFirst({ where: { id, patient: { hospitalId } } });
    if (!existing) return NextResponse.json({ error: "Medical record not found" }, { status: 404 });

    const body = await req.json();
    const data = updateSchema.parse(body);

    const record = await prisma.medicalRecord.update({
      where: { id },
      data: {
        consultationNotes: data.consultationNotes,
        diagnosis: data.diagnosis,
        treatmentPlan: data.treatmentPlan,
        followUpDate: data.followUpDate,
        vitals: data.vitals ?? undefined,
      },
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true } },
        doctor: { select: { user: { select: { name: true } }, specialization: true } },
        prescriptions: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user?.id,
        hospitalId,
        action: "UPDATE",
        entity: "MedicalRecord",
        entityId: id,
        oldValues: {
          consultationNotes: existing.consultationNotes,
          diagnosis: existing.diagnosis,
          treatmentPlan: existing.treatmentPlan,
          followUpDate: existing.followUpDate,
        },
        newValues: data,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("[Medical Record PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
