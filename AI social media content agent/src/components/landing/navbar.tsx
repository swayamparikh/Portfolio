import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-lg">
            <Sparkles className="size-4" />
          </span>
          ContentPilot AI
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">
            Try it free
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign up free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
