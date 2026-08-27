"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clinics, physios } from "@/db/schema";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";

export type AuthState = { error?: string } | null;

export async function signup(_prev: AuthState, form: FormData): Promise<AuthState> {
  const clinicName = String(form.get("clinicName") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!clinicName || !name || !email || !password) return { error: "All fields are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };

  const existing = await db.select({ id: physios.id }).from(physios).where(eq(physios.email, email)).limit(1);
  if (existing.length) return { error: "An account with that email already exists." };

  const [clinic] = await db.insert(clinics).values({ name: clinicName }).returning();
  const [physio] = await db
    .insert(physios)
    .values({
      clinicId: clinic.id,
      name,
      email,
      passwordHash: hashPassword(password),
      role: "owner",
    })
    .returning();

  await createSession(physio.id);
  redirect("/dashboard");
}

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const [physio] = await db.select().from(physios).where(eq(physios.email, email)).limit(1);
  if (!physio || !verifyPassword(password, physio.passwordHash)) {
    return { error: "Those credentials didn't match an account." };
  }

  await createSession(physio.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
