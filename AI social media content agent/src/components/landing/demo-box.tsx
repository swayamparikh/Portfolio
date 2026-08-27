"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { GeneratedContent, Platform } from "@/lib/types";
import { PLATFORM_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResultDisplay } from "@/components/generate/result-display";
import { ResultSkeleton } from "@/components/generate/result-skeleton";

export function DemoBox() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [used, setUsed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (topic.trim().length < 3) {
      toast.error("Give me a bit more to work with — at least 3 characters.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          platform,
          contentType: "caption",
          isDemo: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong.");
        if (res.status === 429) setUsed(true);
        return;
      }
      setResult(data.content);
      setUsed(true);
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="demo" className="border-y">
      <div className="mx-auto max-w-4xl px-4 py-24 md:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Try it right now</h2>
          <p className="text-muted-foreground mt-3">
            One free generation, no account needed. See exactly what you&apos;d get.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick demo</CardTitle>
            <CardDescription>Caption generation — sign up for hashtags, hooks, calendars, and more.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Launching our new eco-friendly water bottle"
                rows={1}
                className="min-h-9 flex-1 resize-none"
                disabled={used}
              />
              <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={loading || used}>
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                Generate
              </Button>
            </form>

            {loading && <ResultSkeleton />}
            {!loading && result && (
              <ResultDisplay
                content={result}
                platform={platform}
                contentType="caption"
                onRegenerate={() => {}}
              />
            )}
            {used && !loading && (
              <p className="text-muted-foreground text-center text-sm">
                That&apos;s your free demo generation.{" "}
                <a href="/signup" className="text-foreground underline underline-offset-4">
                  Sign up free
                </a>{" "}
                for 20/day plus brand profiles, calendars, and your saved library.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
