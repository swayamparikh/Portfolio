const MODEL = "@cf/black-forest-labs/flux-1-schnell";

/**
 * Generates a product/social-post image via Cloudflare Workers AI (free tier).
 * Best-effort: returns null on any failure or missing config so image generation
 * never breaks the core text-generation flow.
 */
export async function generateImage(prompt: string): Promise<string | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token || !prompt) return null;

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.slice(0, 2000) }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const base64 = data?.result?.image;
    if (typeof base64 !== "string" || !base64) return null;

    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}
