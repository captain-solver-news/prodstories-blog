import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';
import { isProduction } from './lib/env';

const nextConfig: NextConfig = {
  agentRules: false,
  async headers() {
    if (isProduction()) return [];

    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        condition: { not: { query: /url/ } },
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default withPayload(nextConfig);
