"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"guest" | "host">("guest");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not create account.");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password.");
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm p-6">
      <h1 className="font-heading text-xl font-bold text-text-heading">
        {mode === "login" ? "Log in to Nestly" : "Create your account"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <Field label="Full name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </Field>
        )}

        <Field label="Email">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Password">
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </Field>

        {mode === "signup" && (
          <Field label="I want to">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "guest" | "host")}
              className="input"
            >
              <option value="guest">Book stays as a guest</option>
              <option value="host">List a property as a host</option>
            </select>
          </Field>
        )}

        {error && <p className="text-sm text-coral-to">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full justify-center" size="lg">
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </Button>
      </form>

      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="mt-4 w-full rounded-full border border-border py-2.5 text-sm font-medium text-text-heading hover:bg-surface"
      >
        Continue with Google
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }
        .input:focus {
          border-color: var(--ocean);
        }
      `}</style>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-text-heading">{label}</span>
      {children}
    </label>
  );
}
