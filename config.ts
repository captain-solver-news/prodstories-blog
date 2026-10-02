import type { StaticContent } from '@/lib/actions/types/static-content';
import { paragraphState } from '@/lib/utils/rich-text';

export const SITE_NAME = 'ProdStories';
export const TWITTER_HANDLE = '@prodstories';

export const PUBLISHER_LOGO = {
  path: '/brand/logo-dark.png',
  width: 1600,
  height: 383,
} as const;

export const LLMS_SUMMARY =
  'Engineering stories from four developers building in public: what we built, what broke, and what we fixed, written from first-hand work in real repositories.';

export const LLMS_DETAILS = [
  'Every post is written by a named author about a tool we actually ran or code we actually shipped. Posts explain the reasoning behind a decision, the options we rejected, and what went wrong, with numbers, diffs, and costs where we have them.',
  'The stack we write about: TypeScript, Next.js, NestJS, Python, PostgreSQL, MongoDB, and Firebase. The Game Dev category is a learning-in-public series: we had no prior game development experience and say so in each post.',
  'All content is in English. Posts are not sponsored.',
].join('\n\n');

export const BLOG_PREFIX = 'blog';
export const AUTHOR_PREFIX = 'author';
export const SUBCATEGORIES_PER_PAGE = 12;
export const POSTS_PER_PAGE = 10;
export const THEME_COOKIE_NAME = 'theme';
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export const POST_CONTENT_IMAGE_SIZES = '(max-width: 46.25rem) calc(100vw - 2.5rem), 700px';

export const HEADER_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const FOOTER_LINKS_1 = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const FOOTER_LINKS_2 = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },
] as const;

export const HAMBURGER_MENU_TRANSITION_MS = 220;

export const HAMBURGER_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },
  { href: '/contact', label: 'Contact' },
] as const;

export const defaultContent = (id: string): StaticContent => ({
  id,
  title: `${id} title`,
  body: paragraphState(`The ${id} content is not added in database yet`),
});
