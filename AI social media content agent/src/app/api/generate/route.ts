import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { brandProfiles, generatedContent } from "@/db/schema";
import { toBrandProfile } from "@/db/mappers";
import { auth } from "@/auth";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { generateWithGroq, GroqError } from "@/lib/groq";
import { generateImage } from "@/lib/image";
import { checkAuthenticatedRateLimit, checkDemoRateLimit } from "@/lib/rate-limit";
import type { GenerateRequest, GenerateResponse, BrandProfile } from "@/lib/types";

const PLATFORMS = new Set(["instagram", "linkedin", "twitter", "facebook", "tiktok"]);
const CONTENT_TYPES = new Set([
  "caption",
  "carousel",
  "video_script",
  "hashtags",
  "calendar",
]);

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const { topic, platform, contentType, brandProfileId, isDemo } = body;

  if (!topic || typeof topic !== "string" || topic.trim().length < 3) {
    return badRequest("Please provide a topic with at least 3 characters.");
  }
  if (!platform || !PLATFORMS.has(platform)) {
    return badRequest("Invalid or missing platform.");
  }
  if (!contentType || !CONTENT_TYPES.has(contentType)) {
    return badRequest("Invalid or missing content type.");
  }

  const session = await auth();
  const userId = session?.user?.id;
  const treatAsDemo = isDemo || !userId;

  if (treatAsDemo) {
    const ip = getClientIp(request);
    const result = await checkDemoRateLimit(ip);
    if (!result.allowed) {
      return NextResponse.json(
        {
          error:
            "You've used your free demo generation. Sign up free to keep generating content.",
        },
        { status: 429 }
      );
    }
  } else {
    const result = await checkAuthenticatedRateLimit(userId);
    if (!result.allowed) {
      return NextResponse.json(
        {
          error:
            "You've hit today's generation limit (20/day) on the free tier. Try again tomorrow.",
        },
        { status: 429 }
      );
    }
  }

  let brand: BrandProfile | null = null;
  if (brandProfileId && userId) {
    const [row] = await db
      .select()
      .from(brandProfiles)
      .where(and(eq(brandProfiles.id, brandProfileId), eq(brandProfiles.userId, userId)))
      .limit(1);
    brand = row ? toBrandProfile(row) : null;
  }

  const systemPrompt = buildSystemPrompt(platform, contentType);
  const userPrompt = buildUserPrompt(body, brand);

  try {
    const content = await generateWithGroq(systemPrompt, userPrompt);

    // Best-effort: image generation failures never break the text generation response.
    content.imageUrl = content.imagePrompt
      ? await generateImage(content.imagePrompt)
      : null;

    if (userId && !isDemo) {
      await db.insert(generatedContent).values({
        userId,
        brandProfileId: brand?.id ?? null,
        platform,
        contentType,
        topic,
        caption: content.caption,
        hashtags: [
          ...content.hashtags.broad,
          ...content.hashtags.niche,
          ...content.hashtags.branded,
        ],
        hooks: content.hooks,
        bestTime: content.bestTime,
        imageUrl: content.imageUrl,
      });
    }

    const response: GenerateResponse = { content };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof GroqError) {
      const status = error.status && error.status < 500 ? error.status : 503;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("Unexpected /api/generate error", error);
    return NextResponse.json(
      { error: "Something went wrong generating your content. Please try again." },
      { status: 500 }
    );
  }
}
