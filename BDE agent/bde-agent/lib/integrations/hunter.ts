// Section 3/7 — Hunter.io: email finding + verification, used as fallback
// when Apollo data is thin (free tier is only 25 searches/month, Section 3).
// Docs: https://hunter.io/api-documentation/v2

const HUNTER_BASE_URL = "https://api.hunter.io/v2";

function requireKey(): string {
  const key = process.env.HUNTER_API_KEY;
  if (!key) throw new Error("HUNTER_API_KEY is not set");
  return key;
}

export async function findEmail(
  domain: string,
  firstName: string,
  lastName: string,
): Promise<string | null> {
  const url = new URL(`${HUNTER_BASE_URL}/email-finder`);
  url.searchParams.set("domain", domain);
  url.searchParams.set("first_name", firstName);
  url.searchParams.set("last_name", lastName);
  url.searchParams.set("api_key", requireKey());

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Hunter email-finder failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data?.data?.email ?? null;
}

export type EmailVerificationResult = "deliverable" | "undeliverable" | "risky" | "unknown";

export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  const url = new URL(`${HUNTER_BASE_URL}/email-verifier`);
  url.searchParams.set("email", email);
  url.searchParams.set("api_key", requireKey());

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Hunter email-verifier failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return (data?.data?.result ?? "unknown") as EmailVerificationResult;
}
