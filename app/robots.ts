import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/url';

export default function robots(): MetadataRoute.Robots {
  return {
    sitemap: `${getSiteUrl()}/sitemap.xml`,
    rules: {
      userAgent: '*',
      allow: ['/', '/api/media/file/'],
      disallow: ['/api/', '/admin'],
    },
  };
}
