import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]),
  method: z.string().optional(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hospitalId = session.user?.hospitalId;
    if (!hospitalId) return NextResponse.json({ error: "No hospital associated" }, { status: 400 });

    const { id } = await params;

    const body = await req.json();
    const data = updateSchema.parse(body);

    const invoice = await prisma.invoice.findFirst({ where: { id, hospitalId } });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const oldValues = { status: invoice.status };

    let updated;
    if (data.status === "PAID") {
      updated = await prisma.invoice.update({
        where: { id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          payment: {
            upsert: {
              create: {
                amount: invoice.totalAmount,
                method: data.method ?? "cash",
                transactionId: data.transactionId,
                notes: data.notes,
              },
              update: {
                amount: invoice.totalAmount,
                method: data.method ?? "cash",
                transactionId: data.transactionId,
                notes: data.notes,
              },
            },
          },
        },
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true } },
          payment: true,
        },
      });
    } else {
      updated = await prisma.invoice.update({
        where: { id },
        data: { status: data.status },
        include: {
          patient: { select: { firstName: true, lastName: true, mrn: true } },
          payment: true,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user?.id,
        hospitalId,
        action: "UPDATE",
        entity: "Invoice",
        entityId: id,
        oldValues,
        newValues: { status: data.status },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("[Billing PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
