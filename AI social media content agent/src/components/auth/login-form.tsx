"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { signInWithPassword, signInWithGoogle } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from "./google-icon";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(signInWithPassword, {});

  return (
    <div className="flex flex-col gap-6">
      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="w-full">
          <GoogleIcon />
          Continue with Google
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">OR</span>
        <Separator className="flex-1" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>

        {state?.error && (
          <p className="text-destructive text-sm">{state.error}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Loader2 className="animate-spin" />}
          Log in
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-foreground underline underline-offset-4">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
