// Section 14 — Notifications. Telegram bot or Discord webhook, whichever is
// configured — both are free and fast to wire up (per spec's recommendation).

export type NotifyEvent =
  | "positive_reply"
  | "meeting_booked"
  | "daily_target_summary"
  | "bounce_rate_spike"
  | "weekly_kpi_digest"
  | "escalation_hard_stop"; // Section 20 — frustrated reply, legal language, low-confidence classification, etc.

export interface NotifyPayload {
  event: NotifyEvent;
  message: string;
}

async function sendTelegram(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });
  if (!res.ok) {
    console.error("Telegram notify failed:", res.status, await res.text());
  }
}

async function sendDiscord(message: string): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });
  if (!res.ok) {
    console.error("Discord notify failed:", res.status, await res.text());
  }
}

const EVENT_PREFIX: Record<NotifyEvent, string> = {
  positive_reply: "🟢 Positive reply",
  meeting_booked: "📅 Meeting booked",
  daily_target_summary: "📊 Daily summary",
  bounce_rate_spike: "🚨 Bounce rate spike — sending paused",
  weekly_kpi_digest: "📈 Weekly KPI digest",
  escalation_hard_stop: "⚠️ Needs your review",
};

export async function notify(payload: NotifyPayload): Promise<void> {
  const message = `${EVENT_PREFIX[payload.event]}\n${payload.message}`;
  await Promise.all([sendTelegram(message), sendDiscord(message)]);
}
