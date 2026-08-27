import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — add it to .env.local (see .env.example)");
}

const globalForDb = globalThis as unknown as {
  _bdePgClient?: postgres.Sql;
};

// Reuse the connection across hot-reloads in dev so we don't exhaust the pool.
const client = globalForDb._bdePgClient ?? postgres(process.env.DATABASE_URL, { max: 5 });
if (process.env.NODE_ENV !== "production") {
  globalForDb._bdePgClient = client;
}

export const db = drizzle(client, { schema });
export { schema };
