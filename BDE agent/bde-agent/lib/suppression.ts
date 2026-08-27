// Section 19 — List Hygiene & Suppression List.
// Checked at the SOURCE step (not just SEND) so suppressed contacts never
// re-enter the pipeline via a future scrape/import.

import { eq } from "drizzle-orm";
import { db } from "./db";
import { suppressionList, leads, type SuppressionEntry } from "./db/schema";

export async function isSuppressed(email: string): Promise<boolean> {
  if (!email) return false;
  const rows = await db
    .select({ id: suppressionList.id })
    .from(suppressionList)
    .where(eq(suppressionList.email, email.toLowerCase()))
    .limit(1);
  return rows.length > 0;
}

export async function addToSuppressionList(
  email: string,
  reason: SuppressionEntry["reason"],
): Promise<void> {
  await db
    .insert(suppressionList)
    .values({ email: email.toLowerCase(), reason })
    .onConflictDoNothing({ target: suppressionList.email });
}

// Section 19: de-dupe against existing clients and active conversations
// before any new batch goes out.
export async function isExistingClientOrActiveConversation(email: string): Promise<boolean> {
  if (!email) return false;
  const rows = await db
    .select({ id: leads.id })
    .from(leads)
    .where(
      eq(leads.email, email.toLowerCase()),
    )
    .limit(1);

  if (rows.length === 0) return false;

  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.email, email.toLowerCase()))
    .limit(1);

  return (
    lead.clientSinceDate != null ||
    ["in_progress", "replied", "booked", "proposal_sent", "contract_sent", "deposit_received", "client"].includes(
      lead.sequenceStatus,
    )
  );
}

// Single gate to call before sourcing OR sending to a given email address.
export async function shouldExclude(email: string): Promise<{ exclude: boolean; reason?: string }> {
  if (await isSuppressed(email)) {
    return { exclude: true, reason: "on suppression list" };
  }
  if (await isExistingClientOrActiveConversation(email)) {
    return { exclude: true, reason: "existing client or active conversation" };
  }
  return { exclude: false };
}

export async function getSuppressedCount(): Promise<number> {
  const rows = await db.select({ id: suppressionList.id }).from(suppressionList);
  return rows.length;
}
