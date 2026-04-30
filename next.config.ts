import type { NextConfig } from "next"

const nextConfig: NextConfig = {
      typescript: { ignoreBuildErrors: true }, // TODO: fix TS errors then set to false
        eslint: { ignoreDuringBuilds: true }, // TODO: clean up ESLint errors
    experimental: {
          optimizePackageImports: ['recharts', 'lucide-react'],
    },
    images: {
          formats: ['image/avif', 'image/webp'],
          deviceSizes: [640, 750, 828, 1080, 1200, 1920],
          imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
          remotePatterns: [
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
                ],
    },
}

export default nextConfig
