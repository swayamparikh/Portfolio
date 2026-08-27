"use client";

import { Clock, Copy, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import type { ContentType, GeneratedContent, Platform } from "@/lib/types";
import { CONTENT_TYPE_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function copy(text: string, label = "Copied to clipboard") {
  navigator.clipboard.writeText(text).then(() => toast.success(label));
}

function allHashtags(content: GeneratedContent) {
  return [
    ...content.hashtags.broad,
    ...content.hashtags.niche,
    ...content.hashtags.branded,
  ];
}

export function ResultDisplay({
  content,
  platform,
  contentType,
  onRegenerate,
}: {
  content: GeneratedContent;
  platform: Platform;
  contentType: ContentType;
  onRegenerate: () => void;
}) {
  const fullPost = `${content.caption}\n\n${allHashtags(content).join(" ")}`;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <CardTitle>{CONTENT_TYPE_LABELS[contentType]}</CardTitle>
          <Badge variant="outline">{PLATFORM_LABELS[platform]}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => copy(fullPost, "Full post copied")}>
            <Copy /> Copy all
          </Button>
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCw /> Regenerate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {content.imageUrl && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Image</h3>
              <a href={content.imageUrl} download="contentpilot-image.jpg">
                <Button variant="ghost" size="sm">
                  <Download /> Download
                </Button>
              </a>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, not a next/image-optimizable asset */}
            <img
              src={content.imageUrl}
              alt="AI-generated visual for this post"
              className="w-full max-w-md rounded-lg border object-cover"
            />
          </section>
        )}

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Caption</h3>
            <Button variant="ghost" size="sm" onClick={() => copy(content.caption)}>
              <Copy /> Copy
            </Button>
          </div>
          <p className="bg-muted/50 rounded-lg border p-3 text-sm whitespace-pre-wrap">
            {content.caption}
          </p>
        </section>

        {content.calendar && content.calendar.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">7-day calendar</h3>
            <div className="flex flex-col gap-2">
              {content.calendar.map((day) => (
                <div key={day.day} className="rounded-lg border p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium">
                      Day {day.day} — {day.theme}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => copy(day.caption)}>
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{day.caption}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {day.hashtags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <Separator />

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Hashtags</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copy(allHashtags(content).join(" "), "Hashtags copied")}
            >
              <Copy /> Copy all
            </Button>
          </div>
          <HashtagGroup label="Broad" tags={content.hashtags.broad} />
          <HashtagGroup label="Niche" tags={content.hashtags.niche} />
          <HashtagGroup label="Branded" tags={content.hashtags.branded} />
        </section>

        <Separator />

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Alternative hooks</h3>
          <ul className="flex flex-col gap-2">
            {content.hooks.map((hook, i) => (
              <li
                key={i}
                className="bg-muted/50 flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm"
              >
                <span>{hook}</span>
                <Button variant="ghost" size="sm" onClick={() => copy(hook)}>
                  <Copy className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <Separator />

        <section className="text-muted-foreground flex items-center gap-2 text-sm">
          <Clock className="size-4" />
          <span>
            Best time to post: <span className="text-foreground font-medium">{content.bestTime}</span>
          </span>
        </section>
      </CardContent>
    </Card>
  );
}

function HashtagGroup({ label, tags }: { label: string; tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-muted-foreground w-14 shrink-0 text-xs">{label}</span>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="cursor-pointer"
          onClick={() => copy(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
