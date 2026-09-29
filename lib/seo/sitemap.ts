import type { MetadataRoute } from 'next';
import { unstable_cache } from 'next/cache';
import { AUTHOR_PREFIX, BLOG_PREFIX } from '@/config';
import getSitemapAuthors from '@/lib/actions/get-sitemap-authors';
import getSitemapCategories from '@/lib/actions/get-sitemap-categories';
import getSitemapPosts from '@/lib/actions/get-sitemap-posts';
import { getSiteUrl } from './url';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toXml(entries: MetadataRoute.Sitemap): string {
  const urls = entries.map((entry) =>
    [
      '<url>',
      `<loc>${escapeXml(entry.url)}</loc>`,
      ...(entry.lastModified ? [`<lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>`] : []),
      ...(entry.changeFrequency ? [`<changefreq>${entry.changeFrequency}</changefreq>`] : []),
      ...(entry.priority !== undefined ? [`<priority>${entry.priority}</priority>`] : []),
      '</url>',
    ].join('\n')
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
  ].join('\n');
}

async function buildSitemapXml(): Promise<string> {
  const siteUrl = getSiteUrl();
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacy-policy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms-and-conditions`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const [categoryRows, postRows, authorRows] = await Promise.all([
    getSitemapCategories(),
    getSitemapPosts(),
    getSitemapAuthors(),
  ]);

  const categoryPages: MetadataRoute.Sitemap = categoryRows.map((row) => ({
    url: `${siteUrl}/${BLOG_PREFIX}/${row.fullPath}`,
    lastModified: row.updatedAt ?? undefined,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const postPages: MetadataRoute.Sitemap = postRows.map((row) => ({
    url: `${siteUrl}/${BLOG_PREFIX}/${row.fullPath}`,
    lastModified: row.updatedAt ?? undefined,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const authorPages: MetadataRoute.Sitemap = authorRows.map((row) => ({
    url: `${siteUrl}/${AUTHOR_PREFIX}/${row.slug}`,
    lastModified: row.updatedAt ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return toXml([...staticPages, ...categoryPages, ...postPages, ...authorPages]);
}

export const generateSitemapXml = unstable_cache(buildSitemapXml, ['sitemap-xml'], { tags: ['sitemap-data'] });
