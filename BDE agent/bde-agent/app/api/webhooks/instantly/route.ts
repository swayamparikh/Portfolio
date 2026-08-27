import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { activityLog, leads } from "@/lib/db/schema";
import { verifyWebhookSecret } from "@/lib/integrations/instantly";
import { incrementDailyStat } from "@/lib/daily-stats";
import { notify } from "@/lib/notify";
import { addToSuppressionList } from "@/lib/suppression";

// Section 21 — opens/replies/bounces from Instantly (or Smartlead).
// Section 4 step 9 (CLASSIFY REPLY) is triggered from here for "replied" events
// via /api/classify-reply, kept as a separate call so classification failures
// don't drop the webhook event itself.
const webhookSchema = z.object({
  event: z.enum(["email_opened", "email_replied", "email_bounced", "email_clicked"]),
  email: z.string().email(),
  reply_text: z.string().optional(),
  campaign_id: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (!verifyWebhookSecret(secret)) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  const rawBody = await req.json();
  const parsed = webhookSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const payload = parsed.data;

  const [lead] = await db.select().from(leads).where(eq(leads.email, payload.email)).limit(1);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found for this email" }, { status: 404 });
  }

  const eventTypeMap = {
    email_opened: "opened",
    email_replied: "replied",
    email_bounced: "bounced",
    email_clicked: "clicked",
  } as const;
  const eventType = eventTypeMap[payload.event];

  await db.insert(activityLog).values({ leadId: lead.id, eventType, rawPayload: rawBody });

  if (payload.event === "email_bounced") {
    await incrementDailyStat("bounces");
    await db.update(leads).set({ sequenceStatus: "bounced", updatedAt: new Date() }).where(eq(leads.id, lead.id));
    await addToSuppressionList(payload.email, "hard_bounce");
  }

  if (payload.event === "email_replied") {
    await incrementDailyStat("replies");
    await db.update(leads).set({ sequenceStatus: "replied", updatedAt: new Date() }).where(eq(leads.id, lead.id));

    // Section 5: "The moment a lead replies, the agent should classify sentiment...
    // speed-to-reply is one of the highest-leverage factors." Awaited (not
    // fire-and-forget) since serverless functions can be frozen once the
    // response is sent — classify-reply handles notify() + hard stops.
    if (payload.reply_text) {
      await fetch(new URL("/api/classify-reply", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, replyText: payload.reply_text }),
      }).catch((err) => console.error("classify-reply dispatch failed:", err));
    } else {
      await notify({ event: "positive_reply", message: `${lead.companyName ?? lead.email} replied — no text captured, check inbox.` });
    }
  }

  return NextResponse.json({ ok: true });
}
