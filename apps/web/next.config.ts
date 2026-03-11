import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@familyflow/shared"],
  images: {
    remotePatterns: []
  }
};

export default nextConfig;

