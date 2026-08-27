import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 py-16">
      <Suspense fallback={null}>
        <AuthForm mode="signup" />
      </Suspense>
      <p className="text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ocean">
          Log in
        </Link>
      </p>
    </div>
  );
}
