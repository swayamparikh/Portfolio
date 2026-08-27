"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useActionState(login, null);

  return (
    <div className="beam glass p-8">
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Pick up where you left off.</p>

      <form action={action} className="mt-7 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="field" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="field" required />
        </div>

        {state?.error && (
          <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {state.error}
          </p>
        )}

        <Submit />
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        No clinic yet?{" "}
        <Link href="/signup" className="text-cyan-300 transition hover:text-cyan-200">Create one</Link>
      </p>
    </div>
  );
}
