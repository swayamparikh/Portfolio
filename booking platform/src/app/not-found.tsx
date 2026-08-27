import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span className="bg-gradient-to-r from-coral-from to-coral-to bg-clip-text font-heading text-2xl font-bold text-transparent">
        Nestly
      </span>
      <h1 className="font-heading text-3xl font-bold text-text-heading">Page not found</h1>
      <p className="max-w-sm text-text-muted">
        This stay isn&apos;t on our map. Let&apos;s get you back to somewhere real.
      </p>
      <Button href="/">Back to homepage</Button>
      <Link href="/search" className="text-sm text-text-muted hover:text-text-heading">
        Or browse stays
      </Link>
    </div>
  );
}
