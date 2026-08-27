// Nestly AI layer (Section 6 of the spec) — backed by the Groq API.
// Every function degrades gracefully to a deterministic, non-AI fallback
// when GROQ_API_KEY isn't set, so the product stays fully usable/demoable
// without a key, and upgrades automatically once one is provisioned.

const GROQ_MODEL = "llama-3.3-70b-versatile";

async function groqChat(messages: { role: "system" | "user"; content: string }[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.4,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content as string | undefined;
}

export interface TripIntent {
  location?: string;
  priceMax?: number;
  amenities: string[];
  summary: string;
}

/** 6.1 — AI Trip Planner: parses a free-text trip description into search params. */
export async function parseTripIntent(prompt: string): Promise<TripIntent> {
  const reply = await groqChat([
    {
      role: "system",
      content:
        "Extract a structured stay-search intent from the user's message. " +
        'Reply ONLY with compact JSON: {"location": string|null, "priceMax": number|null, ' +
        '"amenities": string[], "summary": string}. amenities must be drawn from: ' +
        "wifi, kitchen, parking, pool, washer, air_conditioning.",
    },
    { role: "user", content: prompt },
  ]);

  if (reply) {
    try {
      const parsed = JSON.parse(reply);
      return {
        location: parsed.location ?? undefined,
        priceMax: parsed.priceMax ?? undefined,
        amenities: Array.isArray(parsed.amenities) ? parsed.amenities : [],
        summary: parsed.summary ?? prompt,
      };
    } catch {
      // fall through to heuristic fallback
    }
  }

  return heuristicTripIntent(prompt);
}

function heuristicTripIntent(prompt: string): TripIntent {
  const lower = prompt.toLowerCase();
  const priceMatch = lower.match(/\$?(\d{2,5})\s*(?:\/|per)?\s*(?:night|nightly)?/);
  const amenities = ["wifi", "kitchen", "parking", "pool", "washer", "air_conditioning"].filter(
    (a) => lower.includes(a.replace("_", " ")),
  );
  return {
    priceMax: priceMatch ? Number(priceMatch[1]) : undefined,
    amenities,
    summary: prompt,
  };
}

/** 6.2 — AI Smart Pricing Assistant: suggests a nightly price for a date. */
export async function suggestPrice(params: {
  basePricePerNight: number;
  date: Date;
  comparableAvgPrice?: number;
}): Promise<number> {
  const dow = params.date.getDay();
  const isWeekend = dow === 5 || dow === 6;
  const month = params.date.getMonth();
  const isPeakSeason = month === 5 || month === 6 || month === 11; // Jun/Jul/Dec

  let multiplier = 1;
  if (isWeekend) multiplier += 0.15;
  if (isPeakSeason) multiplier += 0.2;

  const base = params.comparableAvgPrice
    ? (params.basePricePerNight + params.comparableAvgPrice) / 2
    : params.basePricePerNight;

  return Math.round(base * multiplier);
}

/** 6.3 — AI Review Summarizer: condenses reviews into a short, honest blurb. */
export async function summarizeReviews(
  reviews: { rating: number; comment: string | null }[],
): Promise<string | null> {
  if (reviews.length === 0) return null;

  const withText = reviews.filter((r) => r.comment && r.comment.trim().length > 0);
  if (withText.length === 0) return null;

  const reply = await groqChat([
    {
      role: "system",
      content:
        "Summarize these guest reviews of a property in 1-2 honest, concrete sentences. " +
        "Call out both what guests loved and any recurring complaints. No preamble.",
    },
    {
      role: "user",
      content: withText
        .slice(0, 20)
        .map((r) => `${r.rating}/5: ${r.comment}`)
        .join("\n"),
    },
  ]);

  if (reply) return reply.trim();
  return extractiveSummaryFallback(withText);
}

function extractiveSummaryFallback(reviews: { rating: number; comment: string | null }[]) {
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const positive = reviews.filter((r) => r.rating >= 4).length;
  const sample = reviews[0]?.comment?.slice(0, 120);
  return `Guests rate this stay ${avg.toFixed(1)}/5 on average, with ${positive} of ${reviews.length} reviews at 4 stars or higher.${
    sample ? ` One guest wrote: "${sample}${sample.length === 120 ? "…" : ""}"` : ""
  }`;
}

/** 6.4 — AI Listing Description Generator */
export async function generateListingDescription(params: {
  title: string;
  propertyType?: string | null;
  amenities: string[];
  bedrooms?: number | null;
  address?: string | null;
}): Promise<string> {
  const reply = await groqChat([
    {
      role: "system",
      content:
        "Write a compelling, honest 2-3 sentence Airbnb-style listing description. No emojis, no exclamation-mark spam.",
    },
    {
      role: "user",
      content: JSON.stringify(params),
    },
  ]);

  if (reply) return reply.trim();

  const amenityList = params.amenities.slice(0, 4).join(", ");
  return `${params.title} is a ${params.propertyType?.replace("_", " ") ?? "comfortable stay"}${
    params.address ? ` in ${params.address}` : ""
  }${params.bedrooms ? ` with ${params.bedrooms} bedroom${params.bedrooms > 1 ? "s" : ""}` : ""}.${
    amenityList ? ` Guests get access to ${amenityList}.` : ""
  }`;
}

/** 6.5 — AI Host Response Assistant */
export async function draftHostResponse(params: {
  guestMessage: string;
  context?: string;
}): Promise<string> {
  const reply = await groqChat([
    {
      role: "system",
      content:
        "Draft a warm, professional, concise host reply to this guest message. Sign off naturally, no placeholders.",
    },
    {
      role: "user",
      content: params.context
        ? `Context: ${params.context}\n\nGuest message: ${params.guestMessage}`
        : params.guestMessage,
    },
  ]);

  return (
    reply?.trim() ??
    "Thanks so much for reaching out — happy to help with that. Let me know if you have any other questions before your stay!"
  );
}
