// Denormalized daily_stats table (Section 21: "don't compute this from
// activity_log on every page load"). Cron jobs and webhooks call these
// increment helpers as events happen.

import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { dailyStats } from "./db/schema";

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodaysEmailsSent(): Promise<number> {
  const date = todayDateString();
  const [row] = await db.select().from(dailyStats).where(eq(dailyStats.date, date)).limit(1);
  return row?.emailsSent ?? 0;
}

type IncrementableField = "leadsSourced" | "emailsSent" | "replies" | "bounces" | "meetingsBooked";

const COLUMN_MAP: Record<IncrementableField, keyof typeof dailyStats._.columns> = {
  leadsSourced: "leadsSourced",
  emailsSent: "emailsSent",
  replies: "replies",
  bounces: "bounces",
  meetingsBooked: "meetingsBooked",
};

export async function incrementDailyStat(field: IncrementableField, amount = 1): Promise<void> {
  const date = todayDateString();
  const column = dailyStats[COLUMN_MAP[field]];

  await db
    .insert(dailyStats)
    .values({ date, [field]: amount })
    .onConflictDoUpdate({
      target: dailyStats.date,
      set: { [field]: sql`${column} + ${amount}` },
    });
}

export async function setSendingPaused(paused: boolean): Promise<void> {
  const date = todayDateString();
  await db
    .insert(dailyStats)
    .values({ date, sendingPaused: paused })
    .onConflictDoUpdate({
      target: dailyStats.date,
      set: { sendingPaused: paused },
    });
}
