import { Router } from "express";
import { z } from "zod";
import { getSettings, updateSettings } from "../services/settings.js";

export const settingsRouter = Router();

settingsRouter.get("/", async (_req, res) => {
  res.json(await getSettings());
});

const patchSchema = z
  .object({
    chunk_size: z.number().int().min(100).max(4000),
    chunk_overlap: z.number().int().min(0).max(1000),
    top_k: z.number().int().min(1).max(20),
    reranking: z.boolean(),
    model: z.string().min(1),
    temperature: z.number().min(0).max(2),
  })
  .partial();

settingsRouter.put("/", async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(await updateSettings(parsed.data));
});
