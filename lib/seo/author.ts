import { type Metadata } from 'next';
import { AUTHOR_PREFIX } from '@/config';
import type { Author } from '@/lib/actions/types/author';
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext';
import { WithContext, Person } from 'schema-dts';
import { OPEN_GRAPH_DEFAULTS, TWITTER_DEFAULTS } from './social';
import { toCanonicalPath, toPaginatedPath, toPaginatedTitle } from './url';

const DESCRIPTION_LIMIT = 160;

function truncate(value: string, limit = DESCRIPTION_LIMIT): string {
  if (value.length <= limit) return value;

  return `${value.slice(0, value.lastIndexOf(' ', limit) || limit).trimEnd()}…`;
}

function authorBioText(author: Author): string {
  return author.bio ? convertLexicalToPlaintext({ data: author.bio }).trim() : '';
}

function authorDescription(author: Author): string {
  return truncate(authorBioText(author) || `${author.name} — ${author.jobTitle}.`);
}

export function generateAuthorSchema(author: Author): WithContext<Person> {
  const siteUrl = process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const sameAs = [author.githubUrl, author.linkedinUrl].filter((url): url is string => Boolean(url));
  const image = author.avatarDarkMedia?.url ?? author.miniAvatarMedia?.url;
  const imageUrl = image ? new URL(image, siteUrl).toString() : undefined;
  const bioText = authorBioText(author);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.jobTitle,
    url: `${siteUrl}/${AUTHOR_PREFIX}/${author.slug}`,
    ...(bioText ? { description: bioText } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function generateAuthorMetadata(author: Author, page: number = 1): Metadata {
  const title = toPaginatedTitle(author.name, page);
  const description = authorDescription(author);
  const canonicalPath = toPaginatedPath(`/${AUTHOR_PREFIX}/${author.slug}`, page);

  const ogImage = author.avatarDarkMedia?.url ?? undefined;
  return {
    title,
    description,
    alternates: {
      canonical: toCanonicalPath(canonicalPath),
    },
    openGraph: {
      ...OPEN_GRAPH_DEFAULTS,
      type: 'profile',
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
