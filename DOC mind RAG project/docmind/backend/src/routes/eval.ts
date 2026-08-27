import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/client.js";
import { runEvaluation } from "../services/evaluator.js";

export const evalRouter = Router();

const evalSetSchema = z.object({
  question: z.string().min(1),
  expectedAnswer: z.string().min(1),
});

evalRouter.get("/eval-sets", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM eval_sets ORDER BY created_at DESC");
  res.json(rows);
});

evalRouter.post("/eval-sets", async (req, res) => {
  const parsed = evalSetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "question and expectedAnswer are required" });

  const { rows } = await pool.query(
    "INSERT INTO eval_sets (question, expected_answer) VALUES ($1, $2) RETURNING *",
    [parsed.data.question, parsed.data.expectedAnswer]
  );
  res.status(201).json(rows[0]);
});

const runOptionsSchema = z.object({
  chunkSize: z.number().int().positive().optional(),
  topK: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

evalRouter.post("/eval/run", async (req, res) => {
  const parsed = runOptionsSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: "Invalid run options" });

  try {
    const { evalRunId } = await runEvaluation(parsed.data);
    res.status(201).json({ evalRunId });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Evaluation run failed" });
  }
});

evalRouter.get("/eval/runs", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM eval_runs ORDER BY run_at DESC LIMIT 50");
  res.json(rows);
});

evalRouter.get("/eval/runs/:id", async (req, res) => {
  const { rows: runRows } = await pool.query("SELECT * FROM eval_runs WHERE id = $1", [req.params.id]);
  if (runRows.length === 0) return res.status(404).json({ error: "Eval run not found" });

  const { rows: resultRows } = await pool.query(
    `SELECT r.*, s.question, s.expected_answer
     FROM eval_results r
     JOIN eval_sets s ON s.id = r.eval_set_id
     WHERE r.eval_run_id = $1`,
    [req.params.id]
  );

  res.json({ ...runRows[0], results: resultRows });
});
