// Single send entrypoint used by app/api/cron/send-sequences/route.ts.
// Picks SMTP (Section 8 free-tier path) if configured, otherwise falls back
// to Instantly/Smartlead (Section 7) — lets you switch providers via env vars
// only, no code changes.

import { isSmtpConfigured, sendEmailViaSmtp } from "./integrations/smtp";
import { sendEmail as sendViaInstantly } from "./integrations/instantly";

export interface SendOutreachEmailInput {
  toEmail: string;
  subject: string;
  bodyHtml: string;
}

export async function sendOutreachEmail(input: SendOutreachEmailInput): Promise<void> {
  if (isSmtpConfigured()) {
    await sendEmailViaSmtp({ toEmail: input.toEmail, subject: input.subject, bodyHtml: input.bodyHtml });
    return;
  }

  const fromEmail = process.env.OUTREACH_FROM_EMAIL;
  if (!fromEmail) {
    throw new Error("Neither SMTP_USER/SMTP_PASS nor OUTREACH_FROM_EMAIL + INSTANTLY_API_KEY are configured");
  }
  await sendViaInstantly({
    toEmail: input.toEmail,
    fromEmail,
    subject: input.subject,
    bodyHtml: input.bodyHtml,
  });
}
