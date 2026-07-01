import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  serverExternalPackages: ["uploadthing", "@uploadthing/react"],
  async rewrites() {
    return [
      {
        source: '/api/quiz-generator/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? '/api/quiz_generator/api/:path*'
          : 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
