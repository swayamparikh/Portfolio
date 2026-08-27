import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { classifyReply } from "@/lib/integrations/llm";
import { notify } from "@/lib/notify";

const CONFIDENCE_THRESHOLD = 80; // Section 20: below this, default to drafting for approval

const requestSchema = z.object({
  leadId: z.string().uuid(),
  replyText: z.string().min(1),
});

// Section 4 step 9 (CLASSIFY REPLY) + Section 20 hard stops.
// This route ONLY classifies + routes; it never auto-sends a reply itself —
// auto-sending a booking link on a clearly positive reply is a separate,
// explicit action the dashboard/automation triggers after seeing the result.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { leadId, replyText } = parsed.data;

  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const classification = await classifyReply(replyText);

  await db
    .update(leads)
    .set({ replySentiment: classification.sentiment, updatedAt: new Date() })
    .where(eq(leads.id, leadId));

  // Section 20 hard stops — never auto-act, always notify for human review:
  const isHardStop =
    classification.sentiment === "frustrated_or_complaint" ||
    classification.containsLegalOrRefundLanguage ||
    classification.confidence < CONFIDENCE_THRESHOLD;

  if (isHardStop) {
    await notify({
      event: "escalation_hard_stop",
      message: `${lead.companyName ?? lead.email}: "${classification.summary}" (sentiment=${classification.sentiment}, confidence=${classification.confidence}%). Draft a reply yourself — do not auto-send.`,
    });
  } else if (classification.sentiment === "positive") {
    await notify({
      event: "positive_reply",
      message: `${lead.companyName ?? lead.email}: "${classification.summary}" — safe to auto-send booking link.`,
    });
  }

  return NextResponse.json({ classification, requiresHumanReview: isHardStop });
}
