// next.config.ts
import type { NextConfig } from "next";

const backend = (process.env.API_PROXY_URL || "http://backend:9090").replace(/\/$/, "");
const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
