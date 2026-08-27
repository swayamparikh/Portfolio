import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { auth } from "@/auth";
import { addToSuppressionList } from "@/lib/suppression";

const patchLeadSchema = z.object({
  notes: z.string().optional(),
  doNotContact: z.boolean().optional(),
  fitScore: z.number().int().min(0).max(100).optional(),
  serviceTags: z.array(z.string()).optional(),
  sequenceStatus: z
    .enum([
      "not_started",
      "in_progress",
      "replied",
      "booked",
      "proposal_sent",
      "contract_sent",
      "deposit_received",
      "client",
      "bounced",
      "opted_out",
    ])
    .optional(),
  proposalSentDate: z.string().datetime().optional(),
  proposalValue: z.number().optional(),
  clientSinceDate: z.string().datetime().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = patchLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { proposalSentDate, clientSinceDate, proposalValue, ...rest } = parsed.data;

  const [updated] = await db
    .update(leads)
    .set({
      ...rest,
      ...(proposalSentDate && { proposalSentDate: new Date(proposalSentDate) }),
      ...(clientSinceDate && { clientSinceDate: new Date(clientSinceDate) }),
      ...(proposalValue !== undefined && { proposalValue: proposalValue.toString() }),
      updatedAt: new Date(),
    })
    .where(eq(leads.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Section 19: manual do-not-contact flip also suppresses at the list level.
  if (parsed.data.doNotContact && updated.email) {
    await addToSuppressionList(updated.email, "manual");
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(leads).where(eq(leads.id, id));
  return NextResponse.json({ ok: true });
}
