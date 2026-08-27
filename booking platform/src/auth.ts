import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types/next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || user.suspended) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.profilePhotoUrl,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      if (!user.email) return true;
      const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (dbUser?.suspended) return false;
      return true;
    },
    jwt: async ({ token, user }) => {
      const t = token as { id?: string; role?: UserRole };
      if (user) {
        t.id = user.id as string;
        t.role = (user.role as UserRole) ?? "guest";
      } else if (t.id && !t.role) {
        const dbUser = await prisma.user.findUnique({ where: { id: t.id } });
        t.role = dbUser?.role ?? "guest";
      }
      return token;
    },
    session: async ({ session, token }) => {
      const t = token as { id: string; role: UserRole };
      if (session.user) {
        session.user.id = t.id;
        session.user.role = t.role;
      }
      return session;
    },
  },
});
