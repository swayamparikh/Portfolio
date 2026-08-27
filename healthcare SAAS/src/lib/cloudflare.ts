import "server-only";

/**
 * Cloudflare Workers AI — cheap/fast pre-processing so Claude tokens aren't
 * spent on simple cleanup work (spec §8). Used to tidy up a physio's raw
 * shorthand input (voice transcript or quick typed fragments) before it's
 * handed to Claude for the actual SOAP note draft.
 *
 * Fully optional: if credentials are missing or the call fails, callers get
 * the original raw text back untouched — nothing here blocks note drafting.
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const MODEL = "@cf/meta/llama-3.1-8b-instruct";

export const cloudflareConfigured = Boolean(ACCOUNT_ID && API_TOKEN);

/**
 * Expands a physio's shorthand fragments into clean, complete sentences
 * without adding, inferring, or dropping any clinical content. Pure
 * tidy-up — punctuation, expanded abbreviations, sentence boundaries.
 */
export async function cleanupRawInput(raw: string): Promise<string> {
  const trimmed = raw.trim();
  if (!trimmed || !cloudflareConfigured) return raw;

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You clean up a physiotherapist's shorthand session notes into clear, complete sentences. " +
                "Rules: never add, infer, or remove any clinical fact, number, or observation. Never diagnose. " +
                "Only fix punctuation, expand obvious abbreviations (e.g. 'wk' -> 'week', 'flex' -> 'flexion'), " +
                "and turn fragments into full sentences. Output only the cleaned text, nothing else.",
            },
            { role: "user", content: trimmed },
          ],
          max_tokens: 512,
        }),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) return raw;
    const data = (await res.json()) as { success: boolean; result?: { response?: string } };
    const cleaned = data.result?.response?.trim();
    return cleaned && data.success ? cleaned : raw;
  } catch {
    // Network hiccup or rate limit — fall back to the original text.
    return raw;
  }
}
