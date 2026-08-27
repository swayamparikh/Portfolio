import { createHash } from "node:crypto";
import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { generationUsage } from "@/db/schema";
import { isoDaysAgo } from "./utils";

const AUTHENTICATED_DAILY_LIMIT = 20;
const DEMO_LIMIT = 1;
const DEMO_WINDOW_HOURS = 24;

// In-memory fallback used only if the Neon connection isn't configured (e.g. local dev
// without a database yet). Not durable across serverless cold starts / instances.
const memoryStore = new Map<string, number[]>();

function pruneAndCount(key: string, windowMs: number): number {
  const now = Date.now();
  const timestamps = (memoryStore.get(key) ?? []).filter(
    (t) => now - t < windowMs
  );
  memoryStore.set(key, timestamps);
  return timestamps.length;
}

function recordMemory(key: string) {
  const timestamps = memoryStore.get(key) ?? [];
  timestamps.push(Date.now());
  memoryStore.set(key, timestamps);
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

async function checkWithDb(
  column: "userId" | "ipHash",
  value: string,
  limit: number,
  windowHours: number
): Promise<RateLimitResult> {
  const since = new Date(isoDaysAgo(windowHours / 24));

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(generationUsage)
    .where(
      and(
        eq(generationUsage[column], value),
        gte(generationUsage.createdAt, since)
      )
    );

  const used = count ?? 0;
  if (used >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  await db.insert(generationUsage).values({ [column]: value } as never);

  return { allowed: true, remaining: limit - used - 1, limit };
}

/** Rate limit for authenticated users: 20 generations / rolling 24h. */
export async function checkAuthenticatedRateLimit(
  userId: string
): Promise<RateLimitResult> {
  try {
    return await checkWithDb("userId", userId, AUTHENTICATED_DAILY_LIMIT, 24);
  } catch {
    const key = `user:${userId}`;
    const used = pruneAndCount(key, 24 * 60 * 60 * 1000);
    if (used >= AUTHENTICATED_DAILY_LIMIT) {
      return { allowed: false, remaining: 0, limit: AUTHENTICATED_DAILY_LIMIT };
    }
    recordMemory(key);
    return {
      allowed: true,
      remaining: AUTHENTICATED_DAILY_LIMIT - used - 1,
      limit: AUTHENTICATED_DAILY_LIMIT,
    };
  }
}

/** Rate limit for the public no-auth demo: 1 generation / IP / 24h. */
export async function checkDemoRateLimit(ip: string): Promise<RateLimitResult> {
  const ipHash = hashIp(ip);
  try {
    return await checkWithDb("ipHash", ipHash, DEMO_LIMIT, DEMO_WINDOW_HOURS);
  } catch {
    const key = `demo:${ipHash}`;
    const used = pruneAndCount(key, DEMO_WINDOW_HOURS * 60 * 60 * 1000);
    if (used >= DEMO_LIMIT) {
      return { allowed: false, remaining: 0, limit: DEMO_LIMIT };
    }
    recordMemory(key);
    return { allowed: true, remaining: DEMO_LIMIT - used - 1, limit: DEMO_LIMIT };
  }
}
