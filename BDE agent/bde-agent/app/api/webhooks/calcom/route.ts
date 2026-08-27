import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { activityLog, leads } from "@/lib/db/schema";
import { verifyWebhookSignature } from "@/lib/integrations/calcom";
import { incrementDailyStat } from "@/lib/daily-stats";
import { notify } from "@/lib/notify";

// Section 4 step 10 (ROUTE — interested -> book call) + Section 14 immediate notification.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-cal-signature-256");
  if (!(await verifyWebhookSignature(rawBody, signature))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  if (body.triggerEvent !== "BOOKING_CREATED") {
    return NextResponse.json({ ok: true, ignored: body.triggerEvent });
  }

  const attendeeEmail: string | undefined = body.payload?.attendees?.[0]?.email;
  if (!attendeeEmail) {
    return NextResponse.json({ error: "No attendee email in payload" }, { status: 400 });
  }

  const [lead] = await db.select().from(leads).where(eq(leads.email, attendeeEmail)).limit(1);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found for this email" }, { status: 404 });
  }

  await db.update(leads).set({ sequenceStatus: "booked", updatedAt: new Date() }).where(eq(leads.id, lead.id));
  await db.insert(activityLog).values({ leadId: lead.id, eventType: "booked", rawPayload: body });
  await incrementDailyStat("meetingsBooked");

  await notify({
    event: "meeting_booked",
    message: `${lead.companyName ?? lead.email} booked a call at ${body.payload?.startTime ?? "unknown time"}.`,
  });

  return NextResponse.json({ ok: true });
}
