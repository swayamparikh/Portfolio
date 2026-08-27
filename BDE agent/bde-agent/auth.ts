// Single-operator auth (Section 13: "simple email/password auth for yourself
// and any future team member"). Credentials provider backed by the `users`
// table — see scripts/seed.ts for how the admin account gets created.

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true, // required on Vercel — trusts the forwarded host header
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
});
