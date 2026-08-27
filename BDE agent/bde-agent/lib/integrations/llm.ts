// Section 5 ("Best communication"), 7, 17, 21 — LLM wrapper for personalization,
// reply classification, and proposal drafting. Uses OpenRouter's free tier
// (no card required) via the OpenAI-compatible SDK — same client works with
// any OpenAI-compatible provider, just swap LLM_BASE_URL/LLM_MODEL.
//
// Default model is a genuinely free one (openai/gpt-oss-20b:free) — chosen
// over Grok because no Grok model is currently free on OpenRouter or xAI
// direct (xAI requires purchased credits). Check
// openrouter.ai/models?max_price=0 for the current list of free models —
// availability changes over time, so confirm before assuming a model ID
// still works.

import OpenAI from "openai";

function client(): OpenAI {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) throw new Error("LLM_API_KEY is not set");
  const baseURL = process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1";
  return new OpenAI({ apiKey, baseURL });
}

const MODEL = process.env.LLM_MODEL || "openai/gpt-oss-20b:free";

// ---------------------------------------------------------------------------
// Reply classification — Section 4 step 9, Section 20 escalation rules
// ---------------------------------------------------------------------------

export type ReplySentiment =
  | "positive"
  | "negative"
  | "neutral"
  | "not_now"
  | "wrong_person"
  | "out_of_office"
  | "frustrated_or_complaint";

export interface ReplyClassification {
  sentiment: ReplySentiment;
  confidence: number; // 0-100
  containsLegalOrRefundLanguage: boolean;
  summary: string;
}

const classifyTool: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "classify_reply",
    description: "Classify a cold-email reply's sentiment for routing.",
    parameters: {
      type: "object",
      properties: {
        sentiment: {
          type: "string",
          enum: [
            "positive",
            "negative",
            "neutral",
            "not_now",
            "wrong_person",
            "out_of_office",
            "frustrated_or_complaint",
          ],
        },
        confidence: { type: "number", description: "0-100 confidence in this classification" },
        contains_legal_or_refund_language: { type: "boolean" },
        summary: { type: "string", description: "One sentence: what the reply is actually saying" },
      },
      required: ["sentiment", "confidence", "contains_legal_or_refund_language", "summary"],
    },
  },
};

function toolCallArgs(message: OpenAI.Chat.Completions.ChatCompletionMessage): Record<string, unknown> | null {
  const call = message.tool_calls?.[0];
  if (!call || call.type !== "function") return null;
  return JSON.parse(call.function.arguments);
}

// Free-tier models occasionally answer with plain text instead of calling
// the tool, especially on longer/more structured prompts (confirmed in
// testing: reliable for classify_reply, flaky for the longer generate_email
// prompt). One retry with a blunt nudge recovers most of these; if it still
// fails, the caller falls back to a safe default rather than crashing —
// never send/act on unstructured output.
async function callToolWithRetry(
  createArgs: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
): Promise<Record<string, unknown> | null> {
  const first = await client().chat.completions.create(createArgs);
  const firstArgs = toolCallArgs(first.choices[0].message);
  if (firstArgs) return firstArgs;

  const retry = await client().chat.completions.create({
    ...createArgs,
    messages: [
      ...createArgs.messages,
      first.choices[0].message,
      { role: "user", content: "You must call the tool now — respond only with a tool call, no plain text." },
    ],
  });
  return toolCallArgs(retry.choices[0].message);
}

export async function classifyReply(replyText: string): Promise<ReplyClassification> {
  const args = await callToolWithRetry({
    model: MODEL,
    max_tokens: 512,
    tools: [classifyTool],
    // "auto" not a forced tool_choice — free-tier providers reject forced
    // tool_choice ("no online provider... advertises inference-time
    // tool_choice enforcement"). The instruction below reliably gets the
    // tool called anyway.
    tool_choice: "auto",
    messages: [
      {
        role: "user",
        content:
          `Classify this cold-outreach email reply using the classify_reply tool. Flag "frustrated_or_complaint" if there's ` +
          `any frustration, confusion, or threat to report/complain — per policy, those must never ` +
          `be auto-handled (Section 20 of the BDE agent spec). Reply text:\n\n${replyText}`,
      },
    ],
  });

  if (!args) {
    // Section 20: confidence below threshold defaults to human review — a
    // failed classification is the safest thing to route the same way,
    // rather than crashing the reply webhook.
    return {
      sentiment: "neutral",
      confidence: 0,
      containsLegalOrRefundLanguage: false,
      summary: "LLM failed to return a structured classification — needs manual review.",
    };
  }

  const input = args as {
    sentiment: ReplySentiment;
    confidence: number;
    contains_legal_or_refund_language: boolean;
    summary: string;
  };

  return {
    sentiment: input.sentiment,
    confidence: input.confidence,
    containsLegalOrRefundLanguage: input.contains_legal_or_refund_language,
    summary: input.summary,
  };
}

// ---------------------------------------------------------------------------
// Personalized email generation — Section 5 "best communication" rules
// ---------------------------------------------------------------------------

export interface GenerateEmailInput {
  contactName: string;
  companyName: string;
  serviceLine: string;
  templateBody: string; // has {service}/{observation}/{case_study}/{metric} placeholders
  specificDetail: string; // a real, verifiable observation from enrichment data
  geoTone?: string; // e.g. "brief and direct" (US/UK) vs "more formal/relationship framing"
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  skipped: boolean; // true if no specific, verifiable detail was available
  skipReason?: string;
}

const generateEmailTool: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "generate_email",
    description: "Produce a personalized cold outreach email body and subject line.",
    parameters: {
      type: "object",
      properties: {
        skipped: {
          type: "boolean",
          description: "true if there isn't a real, specific, verifiable detail to personalize with",
        },
        skip_reason: { type: "string" },
        subject: { type: "string" },
        body: { type: "string", description: "Under 120 words, one CTA, no corporate filler phrases" },
      },
      required: ["skipped", "subject", "body"],
    },
  },
};

export async function generatePersonalizedEmail(input: GenerateEmailInput): Promise<GeneratedEmail> {
  const args = await callToolWithRetry({
    model: MODEL,
    max_tokens: 700,
    tools: [generateEmailTool],
    tool_choice: "auto", // see note in classifyReply() — forced tool_choice is rejected by free-tier providers
    messages: [
      {
        role: "user",
        content: `Write a cold outreach email using the generate_email tool, following these rules (Section 5 of the BDE agent spec):
- Write like a person, not a template. Ban phrases like "I hope this email finds you well," "I wanted to reach out," "circling back."
- One CTA only: ask for a reply or a 15-min call.
- Under 120 words.
- No attachments/pricing — link to a Loom/portfolio instead if needed.
- Must use ONE specific, verifiably-true detail about this company. If the provided detail isn't
  specific enough (i.e. it's generic and could apply to any company), set skipped=true and explain why
  rather than writing a generic email.
- Tone: ${input.geoTone ?? "brief and direct"}.

Contact: ${input.contactName} at ${input.companyName}
Service line being pitched: ${input.serviceLine}
Specific detail to personalize with: ${input.specificDetail}

Template skeleton for structure/inspiration (not to copy verbatim):
${input.templateBody}`,
      },
    ],
  });

  if (!args) {
    // Section 5: skip rather than risk sending something malformed/generic.
    return {
      subject: "",
      body: "",
      skipped: true,
      skipReason: "LLM failed to return structured output after retry — skipped rather than send a malformed email.",
    };
  }

  const out = args as {
    skipped: boolean;
    skip_reason?: string;
    subject: string;
    body: string;
  };

  return {
    subject: out.subject,
    body: out.body,
    skipped: out.skipped,
    skipReason: out.skip_reason,
  };
}

// ---------------------------------------------------------------------------
// Proposal drafting — Section 17 (draft from call notes, human reviews before send)
// ---------------------------------------------------------------------------

export interface DraftProposalInput {
  companyName: string;
  serviceLine: string;
  callNotes: string;
  priceRange: string;
  paymentTerms: string;
}

export async function draftProposal(input: DraftProposalInput): Promise<string> {
  const completion = await client().chat.completions.create({
    model: MODEL,
    max_tokens: 1200,
    messages: [
      {
        role: "user",
        content: `Draft a one-page proposal from these discovery call notes. Include: scope, timeline,
price, payment terms, and what's NOT included (Section 17 of the BDE agent spec). This is a DRAFT for
human review before sending — flag anything you're unsure about with [CONFIRM: ...].

Company: ${input.companyName}
Service line: ${input.serviceLine}
Price range: ${input.priceRange}
Payment terms: ${input.paymentTerms}
Call notes:
${input.callNotes}`,
      },
    ],
  });

  return completion.choices[0].message.content ?? "";
}
