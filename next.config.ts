import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typescript: {
    // ignoreBuildErrors: true skips TS type-check errors at build time
    // Next.js 16 still supports this option
    ignoreBuildErrors: true,
  },
  // Note: 'eslint' config key was removed in Next.js 16 — no longer supported here
  // Use .eslintrc or eslint.config.mjs to configure ESLint separately
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    // Allow SVG assets (operator logos) via next/image
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Minimise layout shift — keep placeholder blur
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
}

export default nextConfig
