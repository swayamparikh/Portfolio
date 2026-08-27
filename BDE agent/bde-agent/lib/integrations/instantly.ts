// Section 3/5/7 — Instantly.ai: cold email sending/sequencing + deliverability.
// Docs: https://developer.instantly.ai/
// Swap for lib/integrations/smartlead.ts if you pick Smartlead instead —
// same function signatures so callers (send-sequences cron) don't change.

const INSTANTLY_BASE_URL = "https://api.instantly.ai/api/v2";

function requireKey(): string {
  const key = process.env.INSTANTLY_API_KEY;
  if (!key) throw new Error("INSTANTLY_API_KEY is not set");
  return key;
}

export interface SendEmailInput {
  toEmail: string;
  fromEmail: string;
  subject: string;
  bodyHtml: string;
  campaignId?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ id: string }> {
  const res = await fetch(`${INSTANTLY_BASE_URL}/emails/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${requireKey()}`,
    },
    body: JSON.stringify({
      to: input.toEmail,
      from: input.fromEmail,
      subject: input.subject,
      body: { html: input.bodyHtml },
      campaign_id: input.campaignId,
    }),
  });

  if (!res.ok) {
    throw new Error(`Instantly send failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export interface CampaignStats {
  sent: number;
  opened: number;
  replied: number;
  bounced: number;
}

export async function getCampaignStats(campaignId: string): Promise<CampaignStats> {
  const res = await fetch(`${INSTANTLY_BASE_URL}/campaigns/${campaignId}/analytics`, {
    headers: { Authorization: `Bearer ${requireKey()}` },
  });
  if (!res.ok) {
    throw new Error(`Instantly stats failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return {
    sent: data.emails_sent_count ?? 0,
    opened: data.open_count ?? 0,
    replied: data.reply_count ?? 0,
    bounced: data.bounced_count ?? 0,
  };
}

// Verifies the shared secret Instantly sends on its webhook so
// app/api/webhooks/instantly/route.ts can trust the payload.
export function verifyWebhookSecret(providedSecret: string | null): boolean {
  const expected = process.env.INSTANTLY_WEBHOOK_SECRET;
  if (!expected) return true; // no secret configured yet — don't hard-fail local dev
  return providedSecret === expected;
}
