import Link from "next/link";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export default async function LeadsPage() {
  const allLeads = await db.select().from(leads).orderBy(desc(leads.updatedAt)).limit(200);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Leads</h1>
        <Link
          href="/leads/new"
          className="rounded bg-black px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          + New Lead
        </Link>
      </div>
      <div className="overflow-x-auto rounded border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left dark:border-white/10">
              <th className="p-2">Company</th>
              <th className="p-2">Contact</th>
              <th className="p-2">Email</th>
              <th className="p-2">Fit</th>
              <th className="p-2">Tags</th>
              <th className="p-2">Status</th>
              <th className="p-2">DNC</th>
            </tr>
          </thead>
          <tbody>
            {allLeads.map((lead) => (
              <tr key={lead.id} className="border-b border-black/5 hover:bg-black/5 dark:border-white/5 dark:hover:bg-white/5">
                <td className="p-2">
                  <Link href={`/leads/${lead.id}`} className="font-medium hover:underline">
                    {lead.companyName || lead.domain || "—"}
                  </Link>
                </td>
                <td className="p-2">{lead.contactName || "—"}</td>
                <td className="p-2">{lead.email || "—"}</td>
                <td className="p-2">{lead.fitScore ?? 0}</td>
                <td className="p-2">{(lead.serviceTags as string[] | null)?.join(", ") || "—"}</td>
                <td className="p-2">{lead.sequenceStatus}</td>
                <td className="p-2">{lead.doNotContact ? "Yes" : ""}</td>
              </tr>
            ))}
            {allLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center opacity-50">
                  No leads yet — add one manually or wait for the source-leads cron.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
