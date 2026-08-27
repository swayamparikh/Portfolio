import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendEmail, appointmentConfirmationEmail } from "@/lib/email";
import { format } from "date-fns";

const appointmentSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  scheduledAt: z.string(),
  duration: z.number().default(30),
  type: z.string().default("Consultation"),
  chiefComplaint: z.string().optional(),
  notes: z.string().optional(),
  isFirstVisit: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const doctorId = searchParams.get("doctorId");
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");

    const where: any = {
      hospitalId: session.user?.hospitalId,
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.scheduledAt = { gte: startOfDay, lte: endOfDay };
    }

    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { firstName: true, lastName: true, mrn: true, phone: true } },
        doctor: { select: { user: { select: { name: true } }, specialization: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("[Appointments GET]", error);
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
    const data = appointmentSchema.parse(body);

    // Check doctor availability
    const scheduledAt = new Date(data.scheduledAt);
    const endTime = new Date(scheduledAt.getTime() + data.duration * 60000);

    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        status: { in: ["SCHEDULED", "CONFIRMED", "CHECKED_IN"] },
        scheduledAt: {
          lt: endTime,
          gte: new Date(scheduledAt.getTime() - data.duration * 60000),
        },
      },
    });

    if (conflict) {
      return NextResponse.json({ error: "Doctor has a conflicting appointment at this time" }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        hospitalId,
        scheduledAt,
        duration: data.duration,
        type: data.type,
        chiefComplaint: data.chiefComplaint,
        notes: data.notes,
        isFirstVisit: data.isFirstVisit,
        status: "SCHEDULED",
      },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        hospital: true,
      },
    });

    // Send confirmation email
    if (appointment.patient.email) {
      const html = appointmentConfirmationEmail({
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        doctorName: appointment.doctor.user.name,
        date: format(scheduledAt, "MMMM d, yyyy"),
        time: format(scheduledAt, "h:mm a"),
        type: data.type,
        hospitalName: appointment.hospital.name,
      });
      await sendEmail({
        to: appointment.patient.email,
        subject: `Appointment Confirmed — ${format(scheduledAt, "MMM d, yyyy")} at ${format(scheduledAt, "h:mm a")}`,
        html,
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id,
        hospitalId,
        action: "CREATE",
        entity: "Appointment",
        entityId: appointment.id,
        newValues: { patientId: data.patientId, doctorId: data.doctorId, scheduledAt: data.scheduledAt },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("[Appointments POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
