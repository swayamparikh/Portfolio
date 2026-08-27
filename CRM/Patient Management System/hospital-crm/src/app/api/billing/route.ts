import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateInvoiceNumber } from "@/lib/utils";

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  total: z.number().min(0),
  category: z.string().optional(),
});

const invoiceSchema = z.object({
  patientId: z.string(),
  items: z.array(lineItemSchema).min(1),
  taxRate: z.number().default(0),
  discount: z.number().default(0),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospitalId = session.user?.hospitalId;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status");
    const patientId = searchParams.get("patientId");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const where: any = { hospitalId };

    if (status && status !== "All") where.status = status;
    if (patientId) where.patientId = patientId;

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { patient: { firstName: { contains: search, mode: "insensitive" } } },
        { patient: { lastName: { contains: search, mode: "insensitive" } } },
        { patient: { mrn: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true } },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({ invoices, total, page, limit });
  } catch (error) {
    console.error("[Billing GET]", error);
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
    const data = invoiceSchema.parse(body);

    const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
    if (!hospital) return NextResponse.json({ error: "Hospital not found" }, { status: 404 });

    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, hospitalId } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const subtotal = data.items.reduce((sum, i) => sum + i.total, 0);
    const taxAmount = subtotal * data.taxRate;
    const totalAmount = subtotal + taxAmount - data.discount;

    // Generate unique invoice number
    let invoiceNumber: string;
    let attempts = 0;
    do {
      invoiceNumber = generateInvoiceNumber(hospital.slug);
      const exists = await prisma.invoice.findUnique({ where: { invoiceNumber } });
      if (!exists) break;
      attempts++;
    } while (attempts < 5);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceNumber!,
        patientId: data.patientId,
        hospitalId,
        items: data.items,
        subtotal,
        taxRate: data.taxRate,
        taxAmount,
        discount: data.discount,
        totalAmount,
        status: "DRAFT",
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
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
        entity: "Invoice",
        entityId: invoice.id,
        newValues: { invoiceNumber: invoice.invoiceNumber, totalAmount, patientId: data.patientId },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("[Billing POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
