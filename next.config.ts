import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Photos are resized in the browser first (~300-600KB), so this is plenty.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
