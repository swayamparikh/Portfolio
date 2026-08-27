"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { signUpWithPassword, signInWithGoogle } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from "./google-icon";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpWithPassword, {});

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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Ada Lovelace" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
          <p className="text-muted-foreground text-xs">At least 8 characters.</p>
        </div>

        {state?.error && (
          <p className="text-destructive text-sm">{state.error}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Loader2 className="animate-spin" />}
          Create free account
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
