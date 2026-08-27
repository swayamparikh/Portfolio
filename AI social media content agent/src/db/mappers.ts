import type { brandProfiles, generatedContent } from "./schema";
import type { BrandProfile, GeneratedContentRow, Platform, ContentType } from "@/lib/types";

export function toBrandProfile(row: typeof brandProfiles.$inferSelect): BrandProfile {
  return {
    id: row.id,
    user_id: row.userId,
    name: row.name,
    industry: row.industry,
    tone: row.tone,
    audience: row.audience,
    sample_posts: row.samplePosts,
    created_at: row.createdAt.toISOString(),
  };
}

export function toGeneratedContentRow(
  row: typeof generatedContent.$inferSelect
): GeneratedContentRow {
  return {
    id: row.id,
    user_id: row.userId,
    brand_profile_id: row.brandProfileId,
    platform: row.platform as Platform,
    content_type: row.contentType as ContentType,
    topic: row.topic,
    caption: row.caption,
    hashtags: row.hashtags,
    hooks: row.hooks,
    best_time: row.bestTime,
    image_url: row.imageUrl,
    is_favorite: row.isFavorite,
    created_at: row.createdAt.toISOString(),
  };
}
