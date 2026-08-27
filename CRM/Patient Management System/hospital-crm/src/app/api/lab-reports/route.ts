import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const resultSchema = z.object({
  parameter: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
  flag: z.string().optional(),
});

const labReportSchema = z.object({
  patientId: z.string(),
  reportType: z.string().min(1),
  testName: z.string().min(1),
  results: z.array(resultSchema).optional(),
  fileUrl: z.string().optional(),
  notes: z.string().optional(),
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
        { testName: { contains: search, mode: "insensitive" } },
        { reportType: { contains: search, mode: "insensitive" } },
        { patient: { firstName: { contains: search, mode: "insensitive" } } },
        { patient: { lastName: { contains: search, mode: "insensitive" } } },
        { patient: { mrn: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [labReports, total] = await Promise.all([
      prisma.labReport.findMany({
        where,
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true } },
        },
        orderBy: { reportedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.labReport.count({ where }),
    ]);

    return NextResponse.json({ labReports, total, page, limit });
  } catch (error) {
    console.error("[LabReports GET]", error);
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
    const data = labReportSchema.parse(body);

    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, hospitalId } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const labReport = await prisma.labReport.create({
      data: {
        patientId: data.patientId,
        reportType: data.reportType,
        testName: data.testName,
        results: data.results,
        fileUrl: data.fileUrl,
        notes: data.notes,
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
        entity: "LabReport",
        entityId: labReport.id,
        newValues: { patientId: data.patientId, testName: data.testName, reportType: data.reportType },
      },
    });

    return NextResponse.json(labReport, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("[LabReports POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
