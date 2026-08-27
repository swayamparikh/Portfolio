import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]) {
  const result = await pool.query<T>(text, params);
  return result;
}
