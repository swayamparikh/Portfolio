import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { db } from "@/lib/db";
import { activityLog, dailyStats, leads, sequences } from "@/lib/db/schema";
import { isWithinSendWindow } from "@/lib/timezone";
import { generatePersonalizedEmail } from "@/lib/integrations/llm";
import { sendOutreachEmail } from "@/lib/outreach-send";
import { isSmtpConfigured } from "@/lib/integrations/smtp";
import { shouldExclude } from "@/lib/suppression";
import { incrementDailyStat, getTodaysEmailsSent } from "@/lib/daily-stats";

const DEFAULT_SERVICE_LINE = "web_app_development";
const MAX_TOUCHES = 4; // Section 5: 3-4 touches over 10-14 days, then stop

// Section 8 warm-up rule: "start at ~10-15 emails/day and ramp up" — without
// this cap, dumping e.g. 100 freshly-added leads into the system would let a
// single daily cron run email all of them at once on an unwarmed inbox.
// Raise gradually over the 2-3 week warm-up period, then toward the 30-35/day
// target in Section 11, via the DAILY_SEND_CAP env var.
const DAILY_SEND_CAP = Number(process.env.DAILY_SEND_CAP || 15);

function buildSpecificDetail(lead: typeof leads.$inferSelect): string | null {
  const hiring = (lead.hiringSignals as string[] | null)?.[0];
  const tech = (lead.techStack as string[] | null)?.[0];
  if (hiring) return `hiring for ${hiring}`;
  if (tech) return `currently running on ${tech}`;
  if (lead.fundingStatus) return `recent funding status: ${lead.fundingStatus}`;
  return null; // Section 5: skip the lead rather than send a generic email
}

// Section 4 steps 6-8 (SEQUENCE/SEND/FOLLOW-UP) + Section 21 cron spec.
// Runs hourly; only sends to leads whose local time is in their send window
// right now (Section 2), rather than one blast time.
export async function POST(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSmtpConfigured() && !process.env.OUTREACH_FROM_EMAIL) {
    return NextResponse.json(
      { error: "No sending method configured — set SMTP_USER/SMTP_PASS or OUTREACH_FROM_EMAIL + INSTANTLY_API_KEY" },
      { status: 500 },
    );
  }

  // Section 19/20 hard stop: check-bounces cron pauses sending on a bounce-rate spike.
  const [latestStats] = await db.select().from(dailyStats).orderBy(desc(dailyStats.date)).limit(1);
  if (latestStats?.sendingPaused) {
    return NextResponse.json({ sent: 0, skipped: 0, reason: "sending paused — bounce rate spike (Section 19)" });
  }

  const alreadySentToday = await getTodaysEmailsSent();
  const remainingCap = DAILY_SEND_CAP - alreadySentToday;
  if (remainingCap <= 0) {
    return NextResponse.json({ sent: 0, skipped: 0, reason: `daily send cap (${DAILY_SEND_CAP}) already reached today` });
  }

  const candidates = await db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.doNotContact, false),
        inArray(leads.sequenceStatus, ["not_started", "in_progress"]),
      ),
    )
    .limit(200);

  let sent = 0;
  const skipped: string[] = [];

  for (const lead of candidates) {
    if (sent >= remainingCap) break;
    if (!lead.email) continue;
    if (!isWithinSendWindow(lead.geo)) continue;

    const { exclude, reason } = await shouldExclude(lead.email);
    if (exclude) {
      skipped.push(`${lead.email}: ${reason}`);
      continue;
    }

    const [{ value: touchesSent }] = await db
      .select({ value: count() })
      .from(activityLog)
      .where(and(eq(activityLog.leadId, lead.id), eq(activityLog.eventType, "sent")));

    if (touchesSent >= MAX_TOUCHES) continue;

    const stepNumber = touchesSent + 1;

    const [template] = await db
      .select()
      .from(sequences)
      .where(and(eq(sequences.serviceLine, serviceLineFor(lead)), eq(sequences.stepNumber, stepNumber)))
      .limit(1);
    if (!template) continue; // no more steps configured

    if (stepNumber > 1 && lead.lastTouchDate) {
      const daysSinceLastTouch = (Date.now() - lead.lastTouchDate.getTime()) / 86_400_000;
      if (daysSinceLastTouch < template.delayDays) continue; // not due yet
    }

    const specificDetail = buildSpecificDetail(lead);
    if (!specificDetail) {
      skipped.push(`${lead.email}: no specific verifiable detail available (Section 5 skip rule)`);
      continue;
    }

    const generated = await generatePersonalizedEmail({
      contactName: lead.contactName ?? "there",
      companyName: lead.companyName ?? lead.domain ?? "your company",
      serviceLine: serviceLineFor(lead),
      templateBody: template.templateBody,
      specificDetail,
    });

    if (generated.skipped) {
      skipped.push(`${lead.email}: ${generated.skipReason ?? "Claude flagged no specific detail"}`);
      continue;
    }

    await sendOutreachEmail({
      toEmail: lead.email,
      subject: generated.subject,
      bodyHtml: generated.body.replace(/\n/g, "<br/>"),
    });

    await db.insert(activityLog).values({
      leadId: lead.id,
      eventType: "sent",
      rawPayload: { subject: generated.subject, stepNumber },
    });

    await db
      .update(leads)
      .set({ sequenceStatus: "in_progress", lastTouchDate: new Date(), updatedAt: new Date() })
      .where(eq(leads.id, lead.id));

    sent += 1;
  }

  await incrementDailyStat("emailsSent", sent);

  return NextResponse.json({ sent, skipped: skipped.length, skippedDetail: skipped });
}

function serviceLineFor(lead: typeof leads.$inferSelect): string {
  return (lead.serviceTags as string[] | null)?.[0] ?? DEFAULT_SERVICE_LINE;
}
