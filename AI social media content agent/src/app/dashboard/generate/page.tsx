import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { brandProfiles } from "@/db/schema";
import { toBrandProfile } from "@/db/mappers";
import { auth } from "@/auth";
import { GenerateForm } from "@/components/generate/generate-form";
import type { ContentType, Platform } from "@/lib/types";

export const metadata: Metadata = { title: "Generate" };

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{
    topic?: string;
    platform?: string;
    type?: string;
    brandProfileId?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const user = session!.user;

  const rows = await db
    .select()
    .from(brandProfiles)
    .where(eq(brandProfiles.userId, user.id))
    .orderBy(desc(brandProfiles.createdAt));
  const brands = rows.map(toBrandProfile);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Generate content</h1>
        <p className="text-muted-foreground text-sm">
          Describe your topic, pick a platform, and let ContentPilot AI do the rest.
        </p>
      </div>
      <GenerateForm
        brands={brands}
        initial={{
          topic: params.topic,
          platform: params.platform as Platform | undefined,
          contentType: params.type as ContentType | undefined,
          brandProfileId: params.brandProfileId,
        }}
      />
    </div>
  );
}
