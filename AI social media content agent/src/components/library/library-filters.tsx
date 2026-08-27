"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Star } from "lucide-react";

import { PLATFORM_OPTIONS, CONTENT_TYPE_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LibraryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const platform = searchParams.get("platform") ?? "all";
  const contentType = searchParams.get("type") ?? "all";
  const range = searchParams.get("range") ?? "all";
  const favoritesOnly = searchParams.get("favorites") === "1";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleFavorites() {
    const params = new URLSearchParams(searchParams.toString());
    if (favoritesOnly) {
      params.delete("favorites");
    } else {
      params.set("favorites", "1");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={platform} onValueChange={(v) => setParam("platform", v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All platforms</SelectItem>
          {PLATFORM_OPTIONS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={contentType} onValueChange={(v) => setParam("type", v)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Content type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All content types</SelectItem>
          {CONTENT_TYPE_OPTIONS.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={range} onValueChange={(v) => setParam("range", v)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All time</SelectItem>
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="30">Last 30 days</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant={favoritesOnly ? "default" : "outline"}
        size="sm"
        onClick={toggleFavorites}
      >
        <Star className={favoritesOnly ? "fill-current" : ""} />
        Favorites
      </Button>
    </div>
  );
}
