import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

/**
 * Zero-setup persistence layer: SQLite via Node's built-in `node:sqlite` module
 * (no native build, no external service, no credentials). Exposes a `pool.query()`
 * shaped like node-postgres so route code stays familiar and easy to swap onto a
 * real Postgres instance later (see README) by re-pointing this one file.
 */
const dbFile = path.join(process.cwd(), process.env.SQLITE_FILE || 'ledgerlite.db');
const db = new DatabaseSync(dbFile);
db.exec('PRAGMA foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

function coerce(params: any[]): any[] {
  return params.map((p) => {
    if (typeof p === 'boolean') return p ? 1 : 0;
    if (p === undefined) return null;
    return p;
  });
}

export const pool = {
  async query(sql: string, params: any[] = []) {
    const text = sql.replace(/\$\d+/g, '?');
    const args = coerce(params);
    const isReadLike = /^\s*(SELECT|WITH)/i.test(text) || /RETURNING/i.test(text);
    const stmt = db.prepare(text);
    if (isReadLike) {
      const rows = stmt.all(...args) as any[];
      return { rows, rowCount: rows.length };
    }
    const info = stmt.run(...args);
    return { rows: [] as any[], rowCount: Number(info.changes) };
  },
  async end() { db.close(); }
};
