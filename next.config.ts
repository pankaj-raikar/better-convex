import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    browserDebugInfoInTerminal: true,
  },
  reactCompiler: true,
  typedRoutes: true,
};

export default nextConfig;
