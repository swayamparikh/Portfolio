"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { db } from "@/db";
import { users } from "@/db/schema";
import { signIn as authSignIn, signOut as authSignOut } from "@/auth";

export interface AuthActionState {
  error?: string;
}

export async function signInWithPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard");

  try {
    await authSignIn("credentials", { email, password, redirectTo: redirectTo || "/dashboard" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    // NextAuth throws a redirect (NEXT_REDIRECT) on success — let it propagate.
    throw error;
  }
}

export async function signUpWithPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ email, name, password: passwordHash });

  try {
    await authSignIn("credentials", { email, password, redirectTo: "/dashboard" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created — please log in." };
    }
    throw error;
  }
}

export async function signInWithGoogle() {
  await authSignIn("google", { redirectTo: "/dashboard" });
}

export async function signOut() {
  await authSignOut({ redirectTo: "/login" });
  redirect("/login");
}
