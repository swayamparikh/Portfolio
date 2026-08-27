import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-grid px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
      <div className="relative z-10 w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-lg font-semibold"
        >
          <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
            <Sparkles className="size-4" />
          </span>
          ContentPilot AI
        </Link>
        <div className="bg-card rounded-xl border p-6 shadow-sm sm:p-8">{children}</div>
      </div>
    </div>
  );
}
