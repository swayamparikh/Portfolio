"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { generatedContent } from "@/db/schema";
import { auth } from "@/auth";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const userId = await requireUserId();

  await db
    .update(generatedContent)
    .set({ isFavorite })
    .where(and(eq(generatedContent.id, id), eq(generatedContent.userId, userId)));

  revalidatePath("/dashboard/library");
}

export async function deleteContent(id: string) {
  const userId = await requireUserId();

  await db
    .delete(generatedContent)
    .where(and(eq(generatedContent.id, id), eq(generatedContent.userId, userId)));

  revalidatePath("/dashboard/library");
}
