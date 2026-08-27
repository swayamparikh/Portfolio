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

const medicalRecordSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().optional(),
  appointmentId: z.string().optional(),
  consultationNotes: z.string().optional(),
  diagnosis: z.array(z.string()).default([]),
  treatmentPlan: z.string().optional(),
  followUpDate: z.coerce.date().optional(),
  vitals: vitalsSchema,
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospitalId = session.user?.hospitalId;
    if (!hospitalId) return NextResponse.json({ error: "No hospital associated" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    const doctorId = searchParams.get("doctorId");

    const where: any = {
      patient: { hospitalId },
    };

    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;

    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true } },
        doctor: { select: { user: { select: { name: true } }, specialization: true } },
        prescriptions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("[Medical Records GET]", error);
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
    const data = medicalRecordSchema.parse(body);

    let doctorId = data.doctorId;
    if (!doctorId && session.user?.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({ where: { userId: session.user.id } });
      doctorId = doctor?.id;
    }

    if (!doctorId) {
      return NextResponse.json({ error: "doctorId is required" }, { status: 400 });
    }

    // Ensure patient belongs to this hospital
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, hospitalId } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const record = await prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId,
        appointmentId: data.appointmentId,
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
        action: "CREATE",
        entity: "MedicalRecord",
        entityId: record.id,
        newValues: { patientId: data.patientId, doctorId, diagnosis: data.diagnosis },
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("[Medical Records POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
