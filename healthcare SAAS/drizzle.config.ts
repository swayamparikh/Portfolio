import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js reads .env.local automatically; drizzle-kit needs to be told.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
