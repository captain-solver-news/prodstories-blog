import { type Metadata } from 'next';
import { BLOG_PREFIX } from '@/config';
import type { Category } from '@/lib/actions/types/category';
import { type CategoryBreadcrumb } from '@/lib/actions/get-category-breadcrumbs';
import { CollectionPage, Graph } from 'schema-dts';
import { generateBreadcrumbSchema } from './breadcrumbs';
import { toAbsoluteUrl, toCanonicalPath } from './url';
import { OPEN_GRAPH_DEFAULTS, TWITTER_DEFAULTS } from './social';

export function generateCategorySchema(
  category: Category,
  slugs: string[],
  breadcrumbs: CategoryBreadcrumb[] = []
): Graph {
  const canonicalUrl = toAbsoluteUrl(`/${BLOG_PREFIX}/${slugs.join('/')}`);
  const imageUrl = category.ogImage ? toAbsoluteUrl(category.ogImage) : undefined;

  const collectionPage: CollectionPage = {
    '@type': 'CollectionPage',
    name: category.title,
    url: canonicalUrl,
    dateModified: category.lastModified,
    ...(category.seoDescription ? { description: category.seoDescription } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [collectionPage, generateBreadcrumbSchema(breadcrumbs)],
  };
}

export function generateCategoryMetadata(category: Category, slugs: string[]): Metadata {
  const title = category.seoTitle || category.title;
  const description = category.seoDescription ?? category.title;
  const canonicalPath = `/${BLOG_PREFIX}/${slugs.join('/')}`;

  const ogImage = category.ogImage ?? undefined;
  return {
    title,
    description,
    alternates: {
      canonical: toCanonicalPath(canonicalPath),
    },
    ...(category.noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      ...OPEN_GRAPH_DEFAULTS,
      title,
      description,
      url: toCanonicalPath(canonicalPath),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      ...TWITTER_DEFAULTS,
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
