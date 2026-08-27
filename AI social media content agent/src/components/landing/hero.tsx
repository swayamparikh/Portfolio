import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="bg-grid relative overflow-hidden border-b">
      <div className="from-primary/20 pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b to-transparent blur-3xl" />
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-24 text-center md:py-32">
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          <Sparkles className="size-3.5" />
          Powered by Grok
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          On-brand social content,{" "}
          <span className="gradient-text">generated in seconds</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg text-balance">
          Give ContentPilot AI a topic and your brand voice — get back ready-to-post captions,
          grouped hashtags, alternative hooks, and a best-time-to-post suggestion. For every
          platform that matters.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" variant="gradient" asChild>
            <Link href="/signup">
              Start generating free <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#demo">Try it now, no login</a>
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          No credit card required · 20 free generations/day
        </p>
      </div>
    </section>
  );
}
