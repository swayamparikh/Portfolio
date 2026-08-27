"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/pipeline";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-black/10 p-6 dark:border-white/10"
      >
        <div>
          <h1 className="text-lg font-semibold">BDE Agent</h1>
          <p className="text-sm opacity-70">Sign in to your dashboard</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/20"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
