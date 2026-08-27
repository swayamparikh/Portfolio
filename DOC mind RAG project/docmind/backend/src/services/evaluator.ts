import { pool } from "../db/client.js";
import { retrieveChunks } from "./retrieval.js";
import { generateAnswer, judgeFaithfulness, judgeRelevance } from "./llm.js";
import { getSettings, updateSettings, type Settings } from "./settings.js";

const DELAY_BETWEEN_CALLS_MS = 400; // stay well within Groq free-tier rate limits

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PASS_THRESHOLD = 0.6;

export interface EvalRunOptions {
  chunkSize?: number;
  topK?: number;
  temperature?: number;
}

export async function runEvaluation(overrides: EvalRunOptions = {}) {
  let settings: Settings = await getSettings();
  if (overrides.chunkSize || overrides.topK || overrides.temperature !== undefined) {
    settings = await updateSettings({
      chunk_size: overrides.chunkSize ?? settings.chunk_size,
      top_k: overrides.topK ?? settings.top_k,
      temperature: overrides.temperature ?? settings.temperature,
    });
  }

  const { rows: evalSets } = await pool.query("SELECT id, question, expected_answer FROM eval_sets");
  if (evalSets.length === 0) {
    throw new Error("No eval questions defined yet. Add some via POST /api/eval-sets first.");
  }

  const { rows: runRows } = await pool.query(
    `INSERT INTO eval_runs (chunk_size, top_k, temperature)
     VALUES ($1, $2, $3) RETURNING id`,
    [settings.chunk_size, settings.top_k, settings.temperature]
  );
  const evalRunId = runRows[0].id;

  let totalFaithfulness = 0;
  let totalRelevance = 0;
  let totalHits = 0;

  for (const set of evalSets) {
    const retrieved = await retrieveChunks(set.question, settings.top_k, settings.reranking);
    const retrievalHit = retrieved.some((c) =>
      c.content.toLowerCase().includes(set.expected_answer.toLowerCase().slice(0, 40))
    );

    let actualAnswer = "";
    let faithfulness = 0;
    let relevance = 0;

    try {
      const generated = await generateAnswer(set.question, retrieved, {
        model: settings.model,
        temperature: settings.temperature,
      });
      actualAnswer = generated.answer;
      await sleep(DELAY_BETWEEN_CALLS_MS);

      const faithfulnessResult = await judgeFaithfulness(actualAnswer, retrieved, settings.model);
      faithfulness = faithfulnessResult.score;
      await sleep(DELAY_BETWEEN_CALLS_MS);

      const relevanceResult = await judgeRelevance(set.question, actualAnswer, settings.model);
      relevance = relevanceResult.score;
      await sleep(DELAY_BETWEEN_CALLS_MS);
    } catch (err) {
      actualAnswer = `[eval error: ${err instanceof Error ? err.message : "unknown"}]`;
    }

    const passed = retrievalHit && faithfulness >= PASS_THRESHOLD && relevance >= PASS_THRESHOLD;

    totalFaithfulness += faithfulness;
    totalRelevance += relevance;
    if (retrievalHit) totalHits += 1;

    await pool.query(
      `INSERT INTO eval_results
        (eval_run_id, eval_set_id, actual_answer, faithfulness_score, relevance_score, retrieval_hit, passed)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [evalRunId, set.id, actualAnswer, faithfulness, relevance, retrievalHit, passed]
    );
  }

  const n = evalSets.length;
  const overallFaithfulness = totalFaithfulness / n;
  const overallRelevance = totalRelevance / n;
  const overallRetrievalAccuracy = totalHits / n;

  await pool.query(
    `UPDATE eval_runs
     SET overall_faithfulness = $2, overall_relevance = $3, overall_retrieval_accuracy = $4
     WHERE id = $1`,
    [evalRunId, overallFaithfulness, overallRelevance, overallRetrievalAccuracy]
  );

  return { evalRunId };
}
