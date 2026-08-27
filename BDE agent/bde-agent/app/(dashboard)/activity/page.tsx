import { db } from "@/lib/db";
import { dailyStats } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

// Section 13 view 2 — Daily activity log: sent today vs. target (30-35), replies, opens, bounces.
const DAILY_SEND_TARGET = 30;

export default async function ActivityPage() {
  const rows = await db.select().from(dailyStats).orderBy(desc(dailyStats.date)).limit(30);
  const today = rows[0];

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Daily Activity</h1>

      {today && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Sent today" value={`${today.emailsSent} / ${DAILY_SEND_TARGET}`} />
          <StatCard label="Leads sourced" value={today.leadsSourced} />
          <StatCard label="Replies" value={today.replies} />
          <StatCard label="Bounces" value={today.bounces} />
          <StatCard label="Meetings booked" value={today.meetingsBooked} />
        </div>
      )}

      {today?.sendingPaused && (
        <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          Sending is paused — bounce rate spike detected (Section 19). Check Settings before resuming.
        </div>
      )}

      <div className="overflow-x-auto rounded border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left dark:border-white/10">
              <th className="p-2">Date</th>
              <th className="p-2">Sourced</th>
              <th className="p-2">Sent</th>
              <th className="p-2">Replies</th>
              <th className="p-2">Bounces</th>
              <th className="p-2">Meetings</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date} className="border-b border-black/5 dark:border-white/5">
                <td className="p-2">{r.date}</td>
                <td className="p-2">{r.leadsSourced}</td>
                <td className="p-2">{r.emailsSent}</td>
                <td className="p-2">{r.replies}</td>
                <td className="p-2">{r.bounces}</td>
                <td className="p-2">{r.meetingsBooked}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center opacity-50">
                  No activity logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-black/10 p-3 dark:border-white/10">
      <p className="text-xs opacity-60">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
