import type { MetadataRoute } from 'next';
import { AUTHOR_PREFIX, BLOG_PREFIX } from '@/config';
import getSitemapAuthors from '@/lib/actions/get-sitemap-authors';
import getSitemapCategories from '@/lib/actions/get-sitemap-categories';
import getSitemapPosts from '@/lib/actions/get-sitemap-posts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000';
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

  return [...staticPages, ...categoryPages, ...postPages, ...authorPages];
}
