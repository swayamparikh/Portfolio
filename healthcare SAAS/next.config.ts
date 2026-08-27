import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep serverless bundles lean on Vercel
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
