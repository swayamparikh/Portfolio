export type Platform =
  | "instagram"
  | "linkedin"
  | "twitter"
  | "facebook"
  | "tiktok";

export type ContentType =
  | "caption"
  | "carousel"
  | "video_script"
  | "hashtags"
  | "calendar";

export type ToneOption =
  | "Professional"
  | "Playful"
  | "Bold"
  | "Minimal"
  | "Luxury"
  | "Friendly"
  | "Custom";

export interface BrandProfile {
  id: string;
  user_id: string;
  name: string;
  industry: string | null;
  tone: string | null;
  audience: string | null;
  sample_posts: string | null;
  created_at: string;
}

export interface BrandProfileInput {
  name: string;
  industry?: string;
  tone?: string;
  audience?: string;
  sample_posts?: string;
}

export interface HashtagGroup {
  broad: string[];
  niche: string[];
  branded: string[];
}

export interface CalendarDay {
  day: number;
  theme: string;
  caption: string;
  hashtags: string[];
}

/** Structured shape returned by the Groq API for a single generation. */
export interface GeneratedContent {
  caption: string;
  hashtags: HashtagGroup;
  hooks: string[];
  bestTime: string;
  imagePrompt?: string;
  /** Data URL (base64) from Cloudflare Workers AI, or null if image generation is unavailable/failed. */
  imageUrl?: string | null;
  calendar?: CalendarDay[];
}

export interface GeneratedContentRow {
  id: string;
  user_id: string;
  brand_profile_id: string | null;
  platform: Platform;
  content_type: ContentType;
  topic: string | null;
  caption: string | null;
  hashtags: string[] | null;
  hooks: string[] | null;
  best_time: string | null;
  image_url: string | null;
  is_favorite: boolean;
  created_at: string;
}

export interface GenerateRequest {
  topic: string;
  platform: Platform;
  contentType: ContentType;
  brandProfileId?: string;
  toneOverride?: string;
  /** Only used by the public, no-auth "try it free" demo. */
  isDemo?: boolean;
}

export interface GenerateResponse {
  content: GeneratedContent;
  remaining?: number;
}

export interface ApiErrorResponse {
  error: string;
}
