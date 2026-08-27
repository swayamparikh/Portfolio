import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { Palette } from "lucide-react";

import { db } from "@/db";
import { brandProfiles } from "@/db/schema";
import { toBrandProfile } from "@/db/mappers";
import { auth } from "@/auth";
import { BrandCard } from "@/components/brands/brand-card";
import { BrandDialog } from "@/components/brands/brand-dialog";

export const metadata: Metadata = { title: "Brand Profiles" };

export default async function BrandsPage() {
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Brand Profiles</h1>
          <p className="text-muted-foreground text-sm">
            Define a brand&apos;s voice once, reuse it in every generation.
          </p>
        </div>
        <BrandDialog />
      </div>

      {brands.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <Palette className="size-6" />
          </div>
          <div>
            <p className="font-medium">No brand profiles yet</p>
            <p className="text-muted-foreground text-sm">
              Create one to give the AI your brand&apos;s voice and audience.
            </p>
          </div>
          <BrandDialog />
        </div>
      )}
    </div>
  );
}
