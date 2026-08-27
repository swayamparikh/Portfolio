import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { desc, eq, sql } from "drizzle-orm";
import { FileText, Palette, Sparkles, Star } from "lucide-react";

import { db } from "@/db";
import { brandProfiles, generatedContent } from "@/db/schema";
import { auth } from "@/auth";
import { PLATFORM_LABELS, CONTENT_TYPE_LABELS } from "@/lib/constants";
import { StatCard } from "@/components/dashboard/stat-card";
import { PlatformChart } from "@/components/dashboard/platform-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Overview" };

export default async function DashboardOverviewPage() {
  const session = await auth();
  const user = session!.user;

  const [items, [{ count: brandCount }]] = await Promise.all([
    db
      .select()
      .from(generatedContent)
      .where(eq(generatedContent.userId, user.id))
      .orderBy(desc(generatedContent.createdAt)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(brandProfiles)
      .where(eq(brandProfiles.userId, user.id)),
  ]);

  const favoriteCount = items.filter((i) => i.isFavorite).length;

  const platformCounts = Object.entries(
    items.reduce<Record<string, number>>((acc, item) => {
      acc[item.platform] = (acc[item.platform] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([platform, count]) => ({
    platform: PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS] ?? platform,
    count,
  }));

  const recent = items.slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/generate">
            <Sparkles /> New generation
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Posts generated" value={items.length} icon={FileText} />
        <StatCard label="Brand profiles" value={brandCount ?? 0} icon={Palette} />
        <StatCard label="Favorites" value={favoriteCount} icon={Star} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Posts by platform</CardTitle>
          </CardHeader>
          <CardContent>
            {platformCounts.length > 0 ? (
              <PlatformChart data={platformCounts} />
            ) : (
              <p className="text-muted-foreground py-10 text-center text-sm">
                Generate your first post to see stats here.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recent.length > 0 ? (
              recent.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.topic ?? "Untitled"}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge variant="outline" className="text-xs">
                        {PLATFORM_LABELS[item.platform as keyof typeof PLATFORM_LABELS]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {CONTENT_TYPE_LABELS[item.contentType as keyof typeof CONTENT_TYPE_LABELS]}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No activity yet — go generate something.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
