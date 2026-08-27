import { db } from "@/lib/db";
import { dailyStats, leads } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { KpiCharts } from "./kpi-charts";

// Section 13 view 4 — Funnel/KPI charts, feeding straight from Section 10's KPI table.
export default async function AnalyticsPage() {
  const stats = await db.select().from(dailyStats).orderBy(asc(dailyStats.date)).limit(90);
  const allLeads = await db.select().from(leads);

  const totalSent = stats.reduce((acc, s) => acc + s.emailsSent, 0);
  const totalReplies = stats.reduce((acc, s) => acc + s.replies, 0);
  const totalBounces = stats.reduce((acc, s) => acc + s.bounces, 0);
  const totalMeetings = stats.reduce((acc, s) => acc + s.meetingsBooked, 0);
  const positiveReplies = allLeads.filter((l) => l.replySentiment === "positive").length;
  const clients = allLeads.filter((l) => l.sequenceStatus === "client").length;
  const proposalsSent = allLeads.filter((l) => l.proposalSentDate != null).length;

  const kpis = [
    { label: "Deliverability rate", value: pct(totalSent - totalBounces, totalSent), target: ">95%" },
    { label: "Reply rate", value: pct(totalReplies, totalSent), target: "5-15%" },
    { label: "Positive reply rate", value: pct(positiveReplies, totalSent), target: "2-5%" },
    { label: "Meetings / 100 sent", value: totalSent ? ((totalMeetings / totalSent) * 100).toFixed(1) : "0", target: "2-5" },
    { label: "Proposal -> closed-won", value: pct(clients, proposalsSent), target: "track over time" },
    { label: "Bounce rate", value: pct(totalBounces, totalSent), target: "<2%" },
  ];

  const chartData = stats.map((s) => ({
    date: s.date,
    sent: s.emailsSent,
    replies: s.replies,
    bounces: s.bounces,
    meetings: s.meetingsBooked,
  }));

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Analytics</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded border border-black/10 p-3 dark:border-white/10">
            <p className="text-xs opacity-60">{k.label}</p>
            <p className="text-lg font-semibold">{k.value}</p>
            <p className="text-[10px] opacity-40">target: {k.target}</p>
          </div>
        ))}
      </div>

      <KpiCharts data={chartData} />
    </div>
  );
}

function pct(numerator: number, denominator: number): string {
  if (!denominator) return "0%";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}
