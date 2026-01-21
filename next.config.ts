import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Restrict Turbopack to this directory to avoid watching User Home
    turbopack: {
      resolveAlias: {
        // generic match to avoid error if types aren't perfect, but the key is rules or root
        // The warning specifically said "turbopack.root". 
      },
      root: process.cwd(),
    },
  },
};

export default nextConfig;
