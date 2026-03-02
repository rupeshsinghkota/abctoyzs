import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    // Serve modern formats — Vercel CDN negotiates avif/webp automatically
    formats: ['image/avif', 'image/webp'],
    // Cache optimised images on Vercel CDN for 7 days
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // Breakpoints for responsive srcSet (matches Tailwind sm/md/lg/xl/2xl)
    deviceSizes: [390, 640, 768, 1024, 1280, 1536],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Compress responses
  compress: true,
};

export default withPWA(nextConfig);
