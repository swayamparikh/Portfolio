import type { GeneratedContent } from "./types";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export class GroqError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "GroqError";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  return JSON.parse(candidate);
}

function normalize(parsed: unknown): GeneratedContent {
  const root = (parsed && typeof parsed === "object" ? parsed : {}) as Record<string, unknown>;
  const hashtags = (root.hashtags && typeof root.hashtags === "object" ? root.hashtags : {}) as Record<
    string,
    unknown
  >;

  return {
    caption: String(root.caption ?? "").trim(),
    hashtags: {
      broad: Array.isArray(hashtags.broad) ? (hashtags.broad as string[]) : [],
      niche: Array.isArray(hashtags.niche) ? (hashtags.niche as string[]) : [],
      branded: Array.isArray(hashtags.branded) ? (hashtags.branded as string[]) : [],
    },
    hooks: Array.isArray(root.hooks) ? (root.hooks as string[]) : [],
    bestTime: String(root.bestTime ?? "").trim(),
    imagePrompt: String(root.imagePrompt ?? "").trim() || undefined,
    calendar: Array.isArray(root.calendar) ? (root.calendar as GeneratedContent["calendar"]) : undefined,
  };
}

/** Calls the Groq API (OpenAI-compatible schema) with a structured system/user prompt and retries transient failures. */
export async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string,
  { retries = 2 }: { retries?: number } = {}
): Promise<GeneratedContent> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqError("GROQ_API_KEY is not configured on the server.");
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
          response_format: { type: "json_object" },
        }),
      });

      if (response.status === 429 || response.status >= 500) {
        lastError = new GroqError(
          "High demand right now, please try again in a moment.",
          response.status
        );
        if (attempt < retries) {
          await sleep(400 * 2 ** attempt);
          continue;
        }
        throw lastError;
      }

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new GroqError(
          `Groq API request failed (${response.status}): ${body.slice(0, 300)}`,
          response.status
        );
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string") {
        throw new GroqError("Groq API returned an unexpected response shape.");
      }

      return normalize(extractJson(content));
    } catch (error) {
      lastError = error;
      if (error instanceof GroqError && error.status && error.status < 500) {
        throw error;
      }
      if (attempt >= retries) break;
      await sleep(400 * 2 ** attempt);
    }
  }

  if (lastError instanceof GroqError) throw lastError;
  throw new GroqError("High demand right now, please try again in a moment.");
}
