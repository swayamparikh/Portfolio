import { db } from "@/lib/db";
import { dailyStats } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { getSuppressedCount } from "@/lib/suppression";

// Section 13 view 6 — API key management, sending limits, warm-up status.
// Section 8 permissions checklist, rendered as a live status board.
const KEYS: { env: string; label: string; section: string; required: boolean }[] = [
  { env: "APOLLO_API_KEY", label: "Apollo.io (lead sourcing)", section: "Section 3/8", required: true },
  { env: "HUNTER_API_KEY", label: "Hunter.io (email finding/verification)", section: "Section 3/8", required: false },
  { env: "BUILTWITH_API_KEY", label: "BuiltWith (tech stack detection)", section: "Section 3/8", required: false },
  { env: "CRUNCHBASE_API_KEY", label: "Crunchbase (funding signals)", section: "Section 3/8", required: false },
  { env: "SMTP_USER", label: "SMTP sending (Gmail/Workspace app password)", section: "Section 8", required: false },
  { env: "INSTANTLY_API_KEY", label: "Instantly.ai (sending/sequencing, alt. to SMTP)", section: "Section 7/8", required: false },
  { env: "CALCOM_API_KEY", label: "Cal.com (booking)", section: "Section 7/8", required: true },
  { env: "LLM_API_KEY", label: "LLM API — OpenRouter free tier (personalization/classification)", section: "Section 7/8", required: true },
  { env: "TELEGRAM_BOT_TOKEN", label: "Telegram bot (notifications)", section: "Section 14", required: false },
  { env: "DISCORD_WEBHOOK_URL", label: "Discord webhook (notifications, alt.)", section: "Section 14", required: false },
  { env: "DATABASE_URL", label: "Postgres database", section: "Section 13", required: true },
  { env: "CRON_SECRET", label: "Cron route secret", section: "Section 21", required: true },
];

export default async function SettingsPage() {
  const [latestStats] = await db.select().from(dailyStats).orderBy(desc(dailyStats.date)).limit(1);
  const suppressedCount = await getSuppressedCount();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold">Settings</h1>

      <h2 className="mb-2 text-sm font-semibold">API keys (Section 8 checklist)</h2>
      <div className="mb-6 divide-y divide-black/5 rounded border border-black/10 dark:divide-white/5 dark:border-white/10">
        {KEYS.map((k) => {
          const configured = Boolean(process.env[k.env]);
          return (
            <div key={k.env} className="flex items-center justify-between p-3 text-sm">
              <div>
                <p className="font-medium">{k.label}</p>
                <p className="text-xs opacity-50">
                  {k.env} · {k.section} {k.required && "· required"}
                </p>
              </div>
              <span
                className={
                  configured
                    ? "rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-600 dark:text-green-400"
                    : "rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-600 dark:text-red-400"
                }
              >
                {configured ? "Configured" : "Missing"}
              </span>
            </div>
          );
        })}
      </div>

      <h2 className="mb-2 text-sm font-semibold">Sending status</h2>
      <div className="mb-6 rounded border border-black/10 p-3 text-sm dark:border-white/10">
        <p>
          Sending paused (bounce-rate spike, Section 19):{" "}
          <strong>{latestStats?.sendingPaused ? "Yes — resume manually after investigating" : "No"}</strong>
        </p>
        <p className="mt-1">Suppression list size (Section 19): <strong>{suppressedCount}</strong></p>
      </div>

      <p className="text-xs opacity-50">
        Warm-up tracking and per-inbox sending limits (Section 8) live in your sending tool
        (Instantly/Smartlead) — link that dashboard here once you pick a plan.
      </p>
    </div>
  );
}
