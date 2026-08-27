// Section 3/7/13 — Cal.com: free-tier call booking.
// Docs: https://cal.com/docs/api-reference/v2/introduction

const CALCOM_BASE_URL = "https://api.cal.com/v2";

function requireKey(): string {
  const key = process.env.CALCOM_API_KEY;
  if (!key) throw new Error("CALCOM_API_KEY is not set");
  return key;
}

export interface CalcomBooking {
  uid: string;
  title: string;
  attendeeEmail: string;
  startTime: string;
  status: string;
}

export async function getBookings(): Promise<CalcomBooking[]> {
  const res = await fetch(`${CALCOM_BASE_URL}/bookings`, {
    headers: { Authorization: `Bearer ${requireKey()}` },
  });
  if (!res.ok) {
    throw new Error(`Cal.com bookings fetch failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return (data.bookings ?? []).map(
    (b: { uid: string; title: string; attendees: { email: string }[]; startTime: string; status: string }) => ({
      uid: b.uid,
      title: b.title,
      attendeeEmail: b.attendees?.[0]?.email ?? "",
      startTime: b.startTime,
      status: b.status,
    }),
  );
}

// Cal.com signs webhook payloads with HMAC-SHA256 using your webhook secret.
// See: https://cal.com/docs/enterprise-features/api/webhooks#validating-a-webhook
export async function verifyWebhookSignature(rawBody: string, signature: string | null): Promise<boolean> {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret) return true; // no secret configured yet — don't hard-fail local dev
  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const computed = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computed === signature;
}
