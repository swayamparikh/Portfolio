import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; checkEmail?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Log in to keep generating content.
        </p>
      </div>

      {params.checkEmail && (
        <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm text-emerald-600 dark:text-emerald-400">
          Check your inbox to confirm your email, then log in.
        </p>
      )}
      {params.error && (
        <p className="text-destructive text-center text-sm">
          Something went wrong signing you in. Please try again.
        </p>
      )}

      <LoginForm redirectTo={params.redirectTo ?? "/dashboard"} />
    </div>
  );
}
