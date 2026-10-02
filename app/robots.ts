import type { MetadataRoute } from 'next';
import { isProduction } from '@/lib/env';
import { getSiteUrl } from '@/lib/seo/url';

export default function robots(): MetadataRoute.Robots {
  if (!isProduction()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    sitemap: `${getSiteUrl()}/sitemap.xml`,
    rules: {
      userAgent: '*',
      allow: ['/', '/api/media/file/'],
      disallow: ['/api/', '/admin'],
    },
  };
}
