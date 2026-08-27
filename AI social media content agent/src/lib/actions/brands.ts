"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { brandProfiles } from "@/db/schema";
import { auth } from "@/auth";

export interface BrandActionState {
  error?: string;
  success?: boolean;
}

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function upsertBrandProfile(
  _prevState: BrandActionState,
  formData: FormData
): Promise<BrandActionState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim();
  const tone = String(formData.get("tone") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim();
  const samplePosts = String(formData.get("sample_posts") ?? "").trim();

  if (!name) {
    return { error: "Brand name is required." };
  }

  try {
    const userId = await requireUserId();

    const payload = {
      userId,
      name,
      industry: industry || null,
      tone: tone || null,
      audience: audience || null,
      samplePosts: samplePosts || null,
    };

    if (id) {
      await db
        .update(brandProfiles)
        .set(payload)
        .where(and(eq(brandProfiles.id, id), eq(brandProfiles.userId, userId)));
    } else {
      await db.insert(brandProfiles).values(payload);
    }

    revalidatePath("/dashboard/brands");
    revalidatePath("/dashboard/generate");
    return { success: true };
  } catch {
    return { error: "Something went wrong saving this brand profile." };
  }
}

export async function deleteBrandProfile(id: string) {
  const userId = await requireUserId();
  await db
    .delete(brandProfiles)
    .where(and(eq(brandProfiles.id, id), eq(brandProfiles.userId, userId)));
  revalidatePath("/dashboard/brands");
  revalidatePath("/dashboard/generate");
}
