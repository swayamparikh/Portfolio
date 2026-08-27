import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL ?? "https://nestly.example.com";

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/host/", "/admin/", "/trips/", "/messages/"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
