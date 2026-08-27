import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Sparkles className="size-3.5" />
          </span>
          ContentPilot AI
        </Link>
        <p className="text-muted-foreground">
          &copy; {new Date().getFullYear()} ContentPilot AI. Built as a portfolio project.
        </p>
      </div>
    </footer>
  );
}
