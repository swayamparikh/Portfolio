"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span className="bg-gradient-to-r from-coral-from to-coral-to bg-clip-text font-heading text-2xl font-bold text-transparent">
        Nestly
      </span>
      <h1 className="font-heading text-3xl font-bold text-text-heading">Something went wrong</h1>
      <p className="max-w-sm text-text-muted">
        An unexpected error occurred. Try again, or head back to the homepage.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
        <Button href="/">Back to homepage</Button>
      </div>
    </div>
  );
}
