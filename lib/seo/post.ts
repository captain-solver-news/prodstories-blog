import { type Metadata } from 'next';
import { AUTHOR_PREFIX, BLOG_PREFIX, PUBLISHER_LOGO, SITE_NAME } from '@/config';
import { type Post } from '@/lib/actions/types/post';
import { type CategoryBreadcrumb } from '@/lib/actions/get-category-breadcrumbs';
import { BlogPosting, Graph, Organization, Person } from 'schema-dts';
import { generateBreadcrumbSchema } from './breadcrumbs';
import { toAbsoluteUrl, toCanonicalPath } from './url';
import { OPEN_GRAPH_DEFAULTS, TWITTER_DEFAULTS } from './social';

const HEADLINE_LIMIT = 110;

function truncate(value: string, limit: number): string {
  if (value.length <= limit) return value;

  return `${value.slice(0, value.lastIndexOf(' ', limit) || limit).trimEnd()}…`;
}

export function generatePostSchema(post: Post, slugs: string[], breadcrumbs: CategoryBreadcrumb[] = []): Graph {
  const canonicalUrl = toAbsoluteUrl(`/${BLOG_PREFIX}/${slugs.join('/')}`);
  const description = post.seoDescription ?? post.teaser;
  const imageUrl = post.ogImage ? toAbsoluteUrl(post.ogImage) : undefined;

  const publisher: Organization = {
    '@type': 'Organization',
    name: SITE_NAME,
    url: toAbsoluteUrl('/'),
    logo: {
      '@type': 'ImageObject',
      url: toAbsoluteUrl(PUBLISHER_LOGO.path),
      width: `${PUBLISHER_LOGO.width}`,
      height: `${PUBLISHER_LOGO.height}`,
    },
  };

  const authors: Person[] = post.authors.map((author) => ({
    '@type': 'Person',
    name: author.name,
    url: toAbsoluteUrl(`/${AUTHOR_PREFIX}/${author.slug}`),
  }));

  const blogPosting: BlogPosting = {
    '@type': 'BlogPosting',
    headline: truncate(post.title, HEADLINE_LIMIT),
    name: post.title,
    description,
    url: canonicalUrl,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.contentUpdatedAt ?? post.updatedAt,
    publisher,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(authors.length ? { author: authors } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      blogPosting,
      generateBreadcrumbSchema(breadcrumbs, { name: post.title, path: `/${BLOG_PREFIX}/${slugs.join('/')}` }),
    ],
  };
}

export function generatePostMetadata(post: Post, slugs: string[]): Metadata {
  const title = post.seoTitle || post.title;
  const description = post.seoDescription ?? post.teaser;
  const canonicalPath = `/${BLOG_PREFIX}/${slugs.join('/')}`;

  const ogImage = post.ogImage ?? undefined;
  return {
    title,
    description,
    alternates: {
      canonical: toCanonicalPath(canonicalPath),
    },
    ...(post.noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      ...OPEN_GRAPH_DEFAULTS,
      type: 'article',
      title,
      description,
      url: toCanonicalPath(canonicalPath),
      publishedTime: new Date(post.publishedAt ?? post.createdAt).toISOString(),
      modifiedTime: new Date(post.contentUpdatedAt ?? post.updatedAt).toISOString(),
      ...(post.authors.length
        ? { authors: post.authors.map((author) => toAbsoluteUrl(`/${AUTHOR_PREFIX}/${author.slug}`)) }
        : {}),
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
