import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Free to start — 20 generations a day.
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
