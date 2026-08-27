import { pool } from "../db/client.js";

export interface Settings {
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  reranking: boolean;
  model: string;
  temperature: number;
}

export async function getSettings(): Promise<Settings> {
  const { rows } = await pool.query<Settings>("SELECT * FROM settings WHERE id = 1");
  return rows[0];
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const fields = Object.keys(patch);
  if (fields.length === 0) return getSettings();

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = fields.map((f) => (patch as any)[f]);

  const { rows } = await pool.query<Settings>(
    `UPDATE settings SET ${setClause} WHERE id = 1 RETURNING *`,
    values
  );
  return rows[0];
}
