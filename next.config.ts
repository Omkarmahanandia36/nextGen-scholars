import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['ui-avatars.com'],
  },
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
};

export default nextConfig;
