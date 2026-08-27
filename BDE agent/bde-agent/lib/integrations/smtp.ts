// Section 8 "Dedicated email — setup notes" free-tier path: send cold outreach
// directly through an SMTP inbox (Gmail/Workspace app password, or any SMTP
// provider) instead of paying for Instantly/Smartlead while volume is low.
//
// IMPORTANT (Section 5/8 of the spec): use a DEDICATED outreach inbox/subdomain,
// never your main personal or business domain — a bad sender reputation here
// should never touch your primary domain's deliverability. Warm this inbox up
// for 2-3 weeks (~10-15/day, ramping) before running it at the full 30-35/day
// volume — see BDE_Agent_Spec.md Section 5 "Warm-up".

import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    throw new Error("SMTP_USER / SMTP_PASS are not set");
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
    auth: { user, pass },
  });

  return cachedTransporter;
}

export interface SendSmtpEmailInput {
  toEmail: string;
  subject: string;
  bodyHtml: string;
  fromName?: string;
}

export async function sendEmailViaSmtp(input: SendSmtpEmailInput): Promise<{ messageId: string }> {
  const user = process.env.SMTP_USER!;
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from: input.fromName ? `"${input.fromName}" <${user}>` : user,
    to: input.toEmail,
    subject: input.subject,
    html: input.bodyHtml,
  });

  return { messageId: info.messageId };
}

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}
