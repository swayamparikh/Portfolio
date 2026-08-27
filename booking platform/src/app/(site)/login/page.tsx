import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 py-16">
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
      <p className="text-sm text-text-muted">
        New to Nestly?{" "}
        <Link href="/signup" className="font-medium text-ocean">
          Create an account
        </Link>
      </p>
    </div>
  );
}
