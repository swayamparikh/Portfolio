import type { Metadata } from "next";
import { and, desc, eq, gte } from "drizzle-orm";
import { Library as LibraryIcon } from "lucide-react";

import { db } from "@/db";
import { generatedContent } from "@/db/schema";
import { toGeneratedContentRow } from "@/db/mappers";
import { auth } from "@/auth";
import { LibraryFilters } from "@/components/library/library-filters";
import { ContentItem } from "@/components/library/content-item";
import { isoDaysAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Library" };

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    platform?: string;
    type?: string;
    range?: string;
    favorites?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const user = session!.user;

  const conditions = [eq(generatedContent.userId, user.id)];
  if (params.platform) conditions.push(eq(generatedContent.platform, params.platform));
  if (params.type) conditions.push(eq(generatedContent.contentType, params.type));
  if (params.favorites === "1") conditions.push(eq(generatedContent.isFavorite, true));
  if (params.range) {
    const days = Number(params.range);
    if (!Number.isNaN(days)) {
      conditions.push(gte(generatedContent.createdAt, new Date(isoDaysAgo(days))));
    }
  }

  const rows = await db
    .select()
    .from(generatedContent)
    .where(and(...conditions))
    .orderBy(desc(generatedContent.createdAt));
  const items = rows.map(toGeneratedContentRow);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
        <p className="text-muted-foreground text-sm">
          Everything you&apos;ve generated, saved automatically.
        </p>
      </div>

      <LibraryFilters />

      {items.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <ContentItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <LibraryIcon className="size-6" />
          </div>
          <div>
            <p className="font-medium">No content matches these filters</p>
            <p className="text-muted-foreground text-sm">
              Generate something new, or clear your filters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
