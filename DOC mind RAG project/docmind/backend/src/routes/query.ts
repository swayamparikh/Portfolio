import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/client.js";
import { retrieveChunks } from "../services/retrieval.js";
import { generateAnswer } from "../services/llm.js";
import { getSettings } from "../services/settings.js";

export const queryRouter = Router();

const querySchema = z.object({ question: z.string().min(1) });

queryRouter.post("/", async (req, res) => {
  const parsed = querySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "question is required" });

  const { question } = parsed.data;
  const settings = await getSettings();

  const retrieved = await retrieveChunks(question, settings.top_k, settings.reranking);
  if (retrieved.length === 0) {
    return res.json({
      answer: "No documents have been indexed yet, so I have nothing to search.",
      citations: [],
      confidence: "low",
    });
  }

  try {
    const result = await generateAnswer(question, retrieved, {
      model: settings.model,
      temperature: settings.temperature,
    });

    await pool.query(
      `INSERT INTO queries (question, answer, confidence, citations) VALUES ($1, $2, $3, $4::jsonb)`,
      [question, result.answer, result.confidence, JSON.stringify(result.citations)]
    );

    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "LLM generation failed" });
  }
});
