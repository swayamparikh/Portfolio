import "server-only";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { physios, sessionsTable, clinics } from "@/db/schema";

const COOKIE = "pf_session";
const SESSION_DAYS = 14;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export async function createSession(physioId: string) {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(sessionsTable).values({ id, physioId, expiresAt });

  const jar = await cookies();
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(sessionsTable).where(eq(sessionsTable.id, token));
  jar.delete(COOKIE);
}

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  clinicId: string;
  clinicName: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      id: physios.id,
      name: physios.name,
      email: physios.email,
      role: physios.role,
      clinicId: physios.clinicId,
      clinicName: clinics.name,
    })
    .from(sessionsTable)
    .innerJoin(physios, eq(physios.id, sessionsTable.physioId))
    .innerJoin(clinics, eq(clinics.id, physios.clinicId))
    .where(and(eq(sessionsTable.id, token), gt(sessionsTable.expiresAt, new Date())))
    .limit(1);

  return rows[0] ?? null;
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
