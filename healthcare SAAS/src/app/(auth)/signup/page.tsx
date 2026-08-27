"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signup } from "../actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Creating clinic…" : "Create clinic"}
    </button>
  );
}

export default function SignupPage() {
  const [state, action] = useActionState(signup, null);

  return (
    <div className="beam glass p-8">
      <h1 className="text-2xl font-bold tracking-tight">Set up your clinic</h1>
      <p className="mt-2 text-sm text-muted">
        Takes about thirty seconds. You&apos;ll land straight in the dashboard.
      </p>

      <form action={action} className="mt-7 space-y-4">
        <div>
          <label className="label" htmlFor="clinicName">Clinic name</label>
          <input id="clinicName" name="clinicName" className="field" placeholder="Riverside Physiotherapy" required />
        </div>
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" name="name" className="field" placeholder="Alex Moore" required />
        </div>
        <div>
          <label className="label" htmlFor="email">Work email</label>
          <input id="email" name="email" type="email" className="field" placeholder="alex@riversidephysio.com" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="field" placeholder="At least 8 characters" required minLength={8} />
        </div>

        {state?.error && (
          <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {state.error}
          </p>
        )}

        <Submit />
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already set up?{" "}
        <Link href="/login" className="text-cyan-300 transition hover:text-cyan-200">Sign in</Link>
      </p>
    </div>
  );
}
