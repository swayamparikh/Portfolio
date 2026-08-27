"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { Copy, RefreshCw, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import type { GeneratedContentRow } from "@/lib/types";
import { CONTENT_TYPE_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { toggleFavorite, deleteContent } from "@/lib/actions/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ContentItem({ item }: { item: GeneratedContentRow }) {
  const [isFavorite, setOptimisticFavorite] = useOptimistic(item.is_favorite);
  const [, startTransition] = useTransition();

  function handleToggleFavorite() {
    startTransition(async () => {
      setOptimisticFavorite(!isFavorite);
      await toggleFavorite(item.id, !isFavorite);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteContent(item.id);
      toast.success("Deleted from library");
    });
  }

  function handleCopy() {
    const text = [item.caption, (item.hashtags ?? []).join(" ")]
      .filter(Boolean)
      .join("\n\n");
    navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard"));
  }

  const regenerateHref = `/dashboard/generate?topic=${encodeURIComponent(
    item.topic ?? ""
  )}&platform=${item.platform}&type=${item.content_type}${
    item.brand_profile_id ? `&brandProfileId=${item.brand_profile_id}` : ""
  }`;

  return (
    <Card className="gap-3">
      <CardContent className="flex gap-3">
        {item.image_url && (
          // eslint-disable-next-line @next/next/no-img-element -- data: URL, not a next/image-optimizable asset
          <img
            src={item.image_url}
            alt=""
            className="size-20 shrink-0 rounded-md border object-cover"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{PLATFORM_LABELS[item.platform]}</Badge>
              <Badge variant="secondary">{CONTENT_TYPE_LABELS[item.content_type]}</Badge>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle favorite"
                onClick={handleToggleFavorite}
              >
                <Star className={isFavorite ? "fill-amber-400 text-amber-400" : ""} />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Copy" onClick={handleCopy}>
                <Copy className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Regenerate" asChild>
                <Link href={regenerateHref}>
                  <RefreshCw className="size-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Delete" onClick={handleDelete}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          {item.topic && <p className="text-sm font-medium">{item.topic}</p>}
          <p className="text-muted-foreground line-clamp-3 text-sm whitespace-pre-wrap">
            {item.caption}
          </p>

          {item.hashtags && item.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.hashtags.slice(0, 8).map((tag) => (
                <span key={tag} className="text-primary text-xs">
                  {tag}
                </span>
              ))}
              {item.hashtags.length > 8 && (
                <span className="text-muted-foreground text-xs">
                  +{item.hashtags.length - 8} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
