import { Pool } from "pg";

const commonPasswords = [
  "",
  "postgres",
  "admin",
  "root",
  "password",
  "1234",
  "123456",
  "12345678",
  "Postgres@123",
  "Admin@123",
  "postgres123",
];

async function tryConnect(password: string): Promise<boolean> {
  const connectionString = `postgresql://postgres:${password}@localhost:5432/postgres`;
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 2000 });
  try {
    const client = await pool.connect();
    client.release();
    await pool.end();
    return true;
  } catch (err) {
    await pool.end();
    return false;
  }
}

async function findPassword() {
  console.log("🔍 Probing local PostgreSQL port 5432 with common passwords...");
  for (const pwd of commonPasswords) {
    console.log(`   Trying password: "${pwd}"`);
    const success = await tryConnect(pwd);
    if (success) {
      console.log(`\n🎉 Success! Valid PostgreSQL password found: "${pwd}"`);
      process.exit(0);
    }
  }
  console.log("\n❌ No common passwords matched. Please enter your database password.");
  process.exit(1);
}

findPassword();
