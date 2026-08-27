import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const STATIC_ROUTES = [
  "",
  "/search",
  "/about",
  "/how-it-works",
  "/trust-and-safety",
  "/help",
  "/help/cancellation",
  "/contact",
  "/become-a-host",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? "https://nestly.example.com";

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const listings = await prisma.listing
    .findMany({
      where: { status: "approved" },
      select: { id: true, createdAt: true },
      take: 5000,
    })
    .catch(() => []);

  const listingEntries: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${base}/listing/${l.id}`,
    lastModified: l.createdAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticEntries, ...listingEntries];
}
