// One-off runner for prisma/sql/constraints.sql against DATABASE_URL,
// for environments without a psql CLI available.
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sql = readFileSync(new URL("../prisma/sql/constraints.sql", import.meta.url), "utf-8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = sql
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    console.log(`\n> ${statement.slice(0, 80)}...`);
    try {
      await prisma.$executeRawUnsafe(statement);
      console.log("  ok");
    } catch (err) {
      const message = err instanceof Error ? err.message.trim().split("\n").pop() : String(err);
      console.log("  skipped:", message);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
