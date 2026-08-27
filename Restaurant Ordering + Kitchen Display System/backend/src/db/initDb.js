import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
  console.log("Schema applied to database.");
  await pool.end();
}

main().catch((err) => {
  console.error("Failed to initialize database:", err.message);
  process.exit(1);
});
