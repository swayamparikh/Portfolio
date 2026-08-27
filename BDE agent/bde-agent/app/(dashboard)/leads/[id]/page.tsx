import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { leads, activityLog } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { LeadDetailClient } from "./lead-detail-client";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) notFound();

  const activity = await db
    .select()
    .from(activityLog)
    .where(eq(activityLog.leadId, id))
    .orderBy(desc(activityLog.timestamp))
    .limit(100);

  return <LeadDetailClient lead={lead} activity={activity} />;
}
