import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Only local brand assets are served today. Remote patterns stay empty on
    // purpose: no stock photography, no third-party image hosts.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
