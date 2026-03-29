import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "akmweb.youngjoygame.com",
      },
      {
        protocol: "https",
        hostname: "akmpicture.youngjoygame.com",
      },
      {
        protocol: "https",
        hostname: "mlbb-stats.rone.dev",
      },
    ],
  },
};

export default nextConfig;
