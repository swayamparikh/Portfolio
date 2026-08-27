import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    hospitalId?: string | null;
    hospitalName?: string | null;
    hospitalSlug?: string | null;
    avatarUrl?: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      hospitalId?: string | null;
      hospitalName?: string | null;
      hospitalSlug?: string | null;
      avatarUrl?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    hospitalId?: string | null;
    hospitalName?: string | null;
    hospitalSlug?: string | null;
    avatarUrl?: string | null;
  }
}
