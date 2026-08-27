// Section 3/7 — BuiltWith: detect a prospect's tech stack (flags outdated
// stacks as a dev opportunity, feeds lib/scoring.ts).
// Docs: https://api.builtwith.com/free-api

const BUILTWITH_BASE_URL = "https://api.builtwith.com/free1/api.json";

function requireKey(): string {
  const key = process.env.BUILTWITH_API_KEY;
  if (!key) throw new Error("BUILTWITH_API_KEY is not set");
  return key;
}

export async function getTechStack(domain: string): Promise<string[]> {
  const url = `${BUILTWITH_BASE_URL}?KEY=${requireKey()}&LOOKUP=${encodeURIComponent(domain)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`BuiltWith lookup failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const groups = data?.Results?.[0]?.Result?.Paths?.[0]?.Technologies ?? [];
  return groups.map((t: { Name: string }) => t.Name);
}
