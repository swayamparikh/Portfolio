import type { ContentType, Platform } from "./types";

export const TONE_OPTIONS = [
  "Professional",
  "Playful",
  "Bold",
  "Minimal",
  "Luxury",
  "Friendly",
] as const;

export const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
];

export const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string; description: string }[] = [
  { value: "caption", label: "Caption", description: "A single ready-to-post caption" },
  { value: "carousel", label: "Carousel outline", description: "Cover hook + slide-by-slide takeaways" },
  { value: "video_script", label: "Video script", description: "Short-form hook, beats, and CTA" },
  { value: "hashtags", label: "Hashtag set", description: "Deep hashtag research, grouped" },
  { value: "calendar", label: "Content calendar (7-day)", description: "A week of themed post ideas" },
];

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "Twitter / X",
  facebook: "Facebook",
  tiktok: "TikTok",
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  caption: "Caption",
  carousel: "Carousel outline",
  video_script: "Video script",
  hashtags: "Hashtag set",
  calendar: "Content calendar",
};
