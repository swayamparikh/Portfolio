import type { BrandProfile, ContentType, GenerateRequest, Platform } from "./types";

const PLATFORM_RULES: Record<Platform, string> = {
  instagram:
    "Instagram: warm, visual, emoji-friendly. Caption 1-3 short paragraphs, can use line breaks for rhythm. Hashtag block goes at the very end, never inline.",
  linkedin:
    "LinkedIn: professional, insight-led. Open with a hook line, use short paragraphs (1-2 sentences each) and occasional line breaks for readability. Minimal emoji. No hashtag spam — 3-5 relevant hashtags at the end.",
  twitter:
    "Twitter/X: short, punchy, high signal-to-noise. Caption must work standalone under 280 characters. Wit and directness over politeness. 2-4 hashtags max, woven in naturally or at the end.",
  facebook:
    "Facebook: conversational and community-oriented, slightly longer than Instagram, inviting comments/shares. Light emoji use. Hashtags optional, 2-5 at the end.",
  tiktok:
    "TikTok: casual, high-energy, Gen-Z-adjacent voice. Caption is short and teases the video/hook — it supports the video, it doesn't replace it. Trend-aware hashtag mix.",
};

const CONTENT_TYPE_INSTRUCTIONS: Record<ContentType, string> = {
  caption: "Produce a single ready-to-post caption for the platform.",
  carousel:
    "Produce a carousel outline: a short cover-slide hook plus 5-8 slides, each a one-line takeaway. Combine the slide lines into the `caption` field as a numbered list, with the cover hook as the first line.",
  video_script:
    "Produce a short-form video script (15-45 seconds): a hook line, 3-5 beats of spoken narration or on-screen text, and a call-to-action close. Put the full script in the `caption` field with clear line breaks between beats.",
  hashtags:
    "Focus entirely on hashtag research. Still return a one-line `caption` summarizing the content angle, but prioritize a rich, well-grouped hashtag set.",
  calendar:
    "Produce a 7-day content calendar. Fill the `calendar` array with exactly 7 entries (day 1-7), each with a theme, a short caption, and 3-5 hashtags. Also fill `caption` with a one-line summary of the week's theme.",
};

export function buildSystemPrompt(platform: Platform, contentType: ContentType) {
  return `You are ContentPilot AI, an expert social media copywriter and strategist embedded in a SaaS content generation tool.

Your job: turn a brand's voice and a topic into ready-to-post social content for ${platform}.

Platform formatting rules — follow these precisely:
${PLATFORM_RULES[platform]}

Content type: ${contentType}
${CONTENT_TYPE_INSTRUCTIONS[contentType]}

Hashtag rules:
- Return 10-15 hashtags total, grouped into three buckets: "broad" (large, generic reach tags), "niche" (specific to the topic/industry), and "branded" (tags built from the brand name or a campaign-style tag; invent tasteful ones if none are given).
- No duplicate hashtags across groups. No spaces inside a tag. Always include the leading #.

Hook rules:
- Provide 2-3 alternative opening lines/hooks that could replace the first line of the caption, each meaningfully different in angle (curiosity, bold claim, question, relatable pain point, etc).

Best posting time:
- Provide one concise, best-practice suggestion for when to post on ${platform} (e.g. "Tuesday–Thursday, 11am–1pm local time"). This is general guidance, not real analytics — never claim it's personalized data.

Image prompt:
- Write one vivid, concrete text-to-image prompt (1-2 sentences) describing a scroll-stopping visual to accompany this post — a product shot, lifestyle scene, or abstract concept illustration as fits the topic. Describe subject, setting, lighting, and style (e.g. "clean product photography", "candid lifestyle photo", "flat illustration"). No text/words/logos in the image description — image models render text poorly. Never mention people's real names or public figures.

Output contract — respond with ONLY a single JSON object, no markdown fences, no commentary, matching exactly this shape:
{
  "caption": string,
  "hashtags": { "broad": string[], "niche": string[], "branded": string[] },
  "hooks": string[],
  "bestTime": string,
  "imagePrompt": string,
  "calendar": [{ "day": number, "theme": string, "caption": string, "hashtags": string[] }] | null
}

Only populate "calendar" when the content type is "calendar"; otherwise set it to null. Never wrap the JSON in backticks. Never include trailing commas.`;
}

export function buildUserPrompt(
  req: GenerateRequest,
  brand?: BrandProfile | null
) {
  const tone = req.toneOverride || brand?.tone || "Professional";
  const lines = [
    `Topic / brief: ${req.topic}`,
    `Tone of voice: ${tone}`,
  ];

  if (brand) {
    lines.push(`Brand name: ${brand.name}`);
    if (brand.industry) lines.push(`Industry/niche: ${brand.industry}`);
    if (brand.audience) lines.push(`Target audience: ${brand.audience}`);
    if (brand.sample_posts) {
      lines.push(
        `Sample past posts for style reference (match this voice, don't copy it verbatim):\n${brand.sample_posts}`
      );
    }
  } else {
    lines.push(
      "No brand profile provided — infer a plausible, appealing brand persona from the topic and tone."
    );
  }

  return lines.join("\n");
}
