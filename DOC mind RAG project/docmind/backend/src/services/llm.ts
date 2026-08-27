import Groq from "groq-sdk";
import "dotenv/config";
import type { RetrievedChunk } from "./retrieval.js";

let client: Groq | null = null;

function getClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set. Add it to backend/.env before asking questions.");
  }
  if (!client) client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return client;
}

const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export interface Citation {
  documentId: string;
  chunkId: string;
  page: number | null;
  snippet: string;
}

export interface GeneratedAnswer {
  answer: string;
  citations: Citation[];
  confidence: "high" | "medium" | "low";
}

function extractJson(raw: string): any {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("LLM response did not contain JSON");
  return JSON.parse(match[0]);
}

export async function generateAnswer(
  question: string,
  retrievedChunks: RetrievedChunk[],
  opts: { model?: string; temperature?: number } = {}
): Promise<GeneratedAnswer> {
  const groq = getClient();

  const context = retrievedChunks
    .map(
      (c, i) =>
        `[${i}] documentId=${c.documentId} chunkId=${c.chunkId} filename=${c.filename} page=${
          c.pageNumber ?? "n/a"
        } rowRange=${c.rowRange ?? "n/a"}\n${c.content}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = `You are DocMind, a retrieval-grounded question answering assistant.
Answer ONLY using the provided context chunks. If the context does not contain the answer, say so and set confidence to "low".
Every citation you return MUST reference a documentId and chunkId that appears in the context below, with an exact "snippet" copied verbatim from that chunk's content.
Respond with ONLY valid JSON matching this shape, no prose outside the JSON:
{
  "answer": "string",
  "citations": [ { "documentId": "uuid", "chunkId": "uuid", "page": number|null, "snippet": "exact matched text" } ],
  "confidence": "high" | "medium" | "low"
}`;

  const userPrompt = `Context chunks:\n\n${context}\n\nQuestion: ${question}`;

  const completion = await groq.chat.completions.create({
    model: opts.model ?? DEFAULT_MODEL,
    temperature: opts.temperature ?? 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = extractJson(raw);

  return {
    answer: parsed.answer ?? "",
    citations: Array.isArray(parsed.citations) ? parsed.citations : [],
    confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "low",
  };
}

export async function judgeFaithfulness(
  answer: string,
  retrievedChunks: RetrievedChunk[],
  model?: string
): Promise<{ score: number; justification: string }> {
  const groq = getClient();
  const context = retrievedChunks.map((c) => c.content).join("\n\n---\n\n");

  const completion = await groq.chat.completions.create({
    model: model ?? DEFAULT_MODEL,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `You are a strict grading judge. Given retrieved context and an answer, score how well the answer is GROUNDED in the context (no hallucinated facts) from 0.0 to 1.0.
Respond with ONLY valid JSON: { "score": number, "justification": "one line" }`,
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nAnswer:\n${answer}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = extractJson(completion.choices[0]?.message?.content ?? "{}");
  return { score: Number(parsed.score) || 0, justification: parsed.justification ?? "" };
}

export async function judgeRelevance(
  question: string,
  answer: string,
  model?: string
): Promise<{ score: number; justification: string }> {
  const groq = getClient();

  const completion = await groq.chat.completions.create({
    model: model ?? DEFAULT_MODEL,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `You are a strict grading judge. Score how well the answer addresses the question from 0.0 to 1.0, regardless of grounding.
Respond with ONLY valid JSON: { "score": number, "justification": "one line" }`,
      },
      {
        role: "user",
        content: `Question:\n${question}\n\nAnswer:\n${answer}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = extractJson(completion.choices[0]?.message?.content ?? "{}");
  return { score: Number(parsed.score) || 0, justification: parsed.justification ?? "" };
}
