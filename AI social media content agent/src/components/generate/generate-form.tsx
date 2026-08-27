"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { BrandProfile, GeneratedContent, GenerateRequest, Platform, ContentType } from "@/lib/types";
import { PLATFORM_OPTIONS, CONTENT_TYPE_OPTIONS, TONE_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResultDisplay } from "./result-display";
import { ResultSkeleton } from "./result-skeleton";

export function GenerateForm({
  brands,
  initial,
}: {
  brands: BrandProfile[];
  initial?: Partial<{
    topic: string;
    platform: Platform;
    contentType: ContentType;
    brandProfileId: string;
  }>;
}) {
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [platform, setPlatform] = useState<Platform>(initial?.platform ?? "instagram");
  const [contentType, setContentType] = useState<ContentType>(initial?.contentType ?? "caption");
  const [brandProfileId, setBrandProfileId] = useState<string>(initial?.brandProfileId ?? "none");
  const [toneOverride, setToneOverride] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [lastRequest, setLastRequest] = useState<GenerateRequest | null>(null);

  async function runGeneration(req: GenerateRequest) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data.content);
      setLastRequest(req);
      toast.success("Content generated and saved to your library.");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (topic.trim().length < 3) {
      toast.error("Give me a bit more to work with — at least 3 characters.");
      return;
    }
    const req: GenerateRequest = {
      topic,
      platform,
      contentType,
      brandProfileId: brandProfileId !== "none" ? brandProfileId : undefined,
      toneOverride: toneOverride || undefined,
    };
    runGeneration(req);
  }

  function handleRegenerate() {
    if (lastRequest) runGeneration(lastRequest);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="topic">Topic / prompt</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="New product launch — eco-friendly water bottle"
                rows={3}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                <SelectTrigger className="w-full">
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
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Content type</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPE_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {brands.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Brand profile (optional)</Label>
                <Select value={brandProfileId} onValueChange={setBrandProfileId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No brand — use tone below</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label>Tone override (optional)</Label>
              <Select value={toneOverride || "default"} onValueChange={(v) => setToneOverride(v === "default" ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Use brand default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Use brand default</SelectItem>
                  {TONE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" size="lg" disabled={loading} className="mt-2">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {loading ? "Generating..." : "Generate content"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        {loading && <ResultSkeleton />}
        {!loading && result && (
          <ResultDisplay
            content={result}
            platform={platform}
            contentType={contentType}
            onRegenerate={handleRegenerate}
          />
        )}
        {!loading && !result && (
          <div className="text-muted-foreground flex h-full min-h-80 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center">
            <Sparkles className="size-8 opacity-50" />
            <p className="max-w-xs text-sm">
              Fill in a topic and hit generate — your caption, hashtags, and hooks will show up
              here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
