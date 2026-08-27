import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "noreply@medicrm.health";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("[Resend] Failed to send email:", error);
    return { success: false, error };
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export function appointmentConfirmationEmail(data: {
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  hospitalName: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0f766e 0%, #0891b2 100%); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
    .body { padding: 32px; }
    .card { background: #f0fdfa; border-left: 4px solid #0f766e; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .card .row { display: flex; justify-content: space-between; margin: 8px 0; }
    .card .label { color: #6b7280; font-size: 14px; }
    .card .value { font-weight: 600; color: #111827; }
    .button { display: inline-block; background: #0f766e; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 ${data.hospitalName}</h1>
      <p>Appointment Confirmation</p>
    </div>
    <div class="body">
      <p>Dear <strong>${data.patientName}</strong>,</p>
      <p>Your appointment has been confirmed. Here are the details:</p>
      <div class="card">
        <div class="row"><span class="label">Doctor</span><span class="value">Dr. ${data.doctorName}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${data.date}</span></div>
        <div class="row"><span class="label">Time</span><span class="value">${data.time}</span></div>
        <div class="row"><span class="label">Type</span><span class="value">${data.type}</span></div>
      </div>
      <p>Please arrive 15 minutes early and bring any previous medical records.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/appointments" class="button">View Appointment</a>
      <p style="color: #6b7280; font-size: 14px;">Need to reschedule? Contact us at least 2 hours before your appointment.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${data.hospitalName} · All rights reserved</p>
      <p>This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function followUpEmail(data: {
  patientName: string;
  message: string;
  hospitalName: string;
  dayOffset: number;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #0891b2 100%); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .message-box { background: #faf5ff; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #e9d5ff; }
    .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; }
    .disclaimer { background: #fef3c7; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💊 ${data.hospitalName}</h1>
      <p>Day ${data.dayOffset} Follow-Up</p>
    </div>
    <div class="body">
      <p>Dear <strong>${data.patientName}</strong>,</p>
      <div class="message-box">
        <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">${data.message}</p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal" class="button">View Your Health Dashboard</a>
      <div class="disclaimer">
        ⚠️ <strong>Medical Disclaimer:</strong> This is an automated follow-up message and does not constitute medical advice. If you have urgent medical concerns, please contact your doctor immediately or call emergency services.
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${data.hospitalName}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function invoiceEmail(data: {
  patientName: string;
  invoiceNumber: string;
  amount: number;
  hospitalName: string;
  dueDate: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0f766e 0%, #0891b2 100%); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .amount-box { background: #f0fdfa; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0; }
    .amount-box .amount { font-size: 36px; font-weight: 700; color: #0f766e; }
    .button { display: inline-block; background: #0f766e; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧾 Invoice from ${data.hospitalName}</h1>
    </div>
    <div class="body">
      <p>Dear <strong>${data.patientName}</strong>,</p>
      <p>Please find your invoice <strong>#${data.invoiceNumber}</strong> below.</p>
      <div class="amount-box">
        <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Total Amount Due</div>
        <div class="amount">₹${data.amount.toLocaleString("en-IN")}</div>
        <div style="color: #6b7280; font-size: 14px; margin-top: 8px;">Due by ${data.dueDate}</div>
      </div>
      <center>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/invoices" class="button">Pay Now / View Invoice</a>
      </center>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${data.hospitalName}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
