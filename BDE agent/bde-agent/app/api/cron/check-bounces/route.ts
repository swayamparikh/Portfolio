import { NextRequest, NextResponse } from "next/server";
import { and, count, eq, gte } from "drizzle-orm";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";
import { setSendingPaused } from "@/lib/daily-stats";
import { notify } from "@/lib/notify";

const BOUNCE_RATE_ALERT_THRESHOLD = 0.05; // Section 10/14/19/20: >5% triggers pause + alert

// Section 19: "if bounce rate spikes above ~5%... the agent should pause
// sending automatically and alert you rather than continuing to burn the
// domain while you're not looking." Section 21 cron spec: every few hours.
export async function POST(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [{ value: sentCount }] = await db
    .select({ value: count() })
    .from(activityLog)
    .where(and(eq(activityLog.eventType, "sent"), gte(activityLog.timestamp, since)));

  const [{ value: bounceCount }] = await db
    .select({ value: count() })
    .from(activityLog)
    .where(and(eq(activityLog.eventType, "bounced"), gte(activityLog.timestamp, since)));

  const bounceRate = sentCount > 0 ? bounceCount / sentCount : 0;
  const shouldPause = bounceRate > BOUNCE_RATE_ALERT_THRESHOLD;

  await setSendingPaused(shouldPause);

  if (shouldPause) {
    await notify({
      event: "bounce_rate_spike",
      message: `Bounce rate over the last 24h is ${(bounceRate * 100).toFixed(1)}% (${bounceCount}/${sentCount}) — above the 5% threshold. Sending has been paused; check domain reputation before resuming.`,
    });
  }

  return NextResponse.json({ sentCount, bounceCount, bounceRate, paused: shouldPause });
}
