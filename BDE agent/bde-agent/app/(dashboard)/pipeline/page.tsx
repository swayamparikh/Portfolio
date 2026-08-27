import Link from "next/link";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

// Section 13 view 1 — Pipeline board: leads by stage.
const STAGES = [
  "not_started",
  "in_progress",
  "replied",
  "booked",
  "proposal_sent",
  "contract_sent",
  "deposit_received",
  "client",
] as const;

const STAGE_LABELS: Record<(typeof STAGES)[number], string> = {
  not_started: "Sourced",
  in_progress: "Contacted",
  replied: "Replied",
  booked: "Meeting Booked",
  proposal_sent: "Proposal Sent",
  contract_sent: "Contract Sent",
  deposit_received: "Deposit Received",
  client: "Client",
};

export default async function PipelinePage() {
  const allLeads = await db.select().from(leads).orderBy(desc(leads.updatedAt)).limit(500);

  const byStage = STAGES.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    leads: allLeads.filter((l) => l.sequenceStatus === stage),
  }));

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Pipeline</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {byStage.map((col) => (
          <div key={col.stage} className="w-64 shrink-0 rounded border border-black/10 dark:border-white/10">
            <div className="border-b border-black/10 px-3 py-2 text-sm font-medium dark:border-white/10">
              {col.label} <span className="opacity-50">({col.leads.length})</span>
            </div>
            <div className="max-h-[70vh] space-y-2 overflow-y-auto p-2">
              {col.leads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="block rounded border border-black/10 p-2 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                >
                  <p className="font-medium">{lead.companyName || lead.domain || "Unnamed lead"}</p>
                  <p className="text-xs opacity-60">{lead.contactName || lead.email}</p>
                  <p className="text-xs opacity-60">Fit: {lead.fitScore ?? 0}</p>
                </Link>
              ))}
              {col.leads.length === 0 && <p className="p-2 text-xs opacity-40">No leads</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
