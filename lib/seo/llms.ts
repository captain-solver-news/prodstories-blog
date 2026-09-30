import { convertLexicalToMarkdown, editorConfigFactory } from '@payloadcms/richtext-lexical';
import { getPayload, type RichTextField } from 'payload';
import config from '@payload-config';
import { AUTHOR_PREFIX, BLOG_PREFIX, LLMS_DETAILS, LLMS_SUMMARY, SITE_NAME } from '@/config';
import getLlmsAuthors from '@/lib/actions/get-llms-authors';
import getLlmsFullPosts, { type LlmsFullPostRow } from '@/lib/actions/get-llms-full-posts';
import getLlmsPosts, { type LlmsPostRow } from '@/lib/actions/get-llms-posts';
import getRootCategories from '@/lib/actions/get-root-categories';
import populateLexicalUploads from '@/lib/utils/populate-lexical-uploads';
import { getSiteUrl, toAbsoluteUrl } from './url';

function inline(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function link(title: string, path: string, description?: string | null): string {
  const label = inline(title).replace(/[[\]]/g, '\\$&');
  const note = description ? inline(description) : '';

  return `- [${label}](${toAbsoluteUrl(path)})${note ? `: ${note}` : ''}`;
}

function section(heading: string, lines: string[]): string {
  return [`## ${heading}`, '', ...lines].join('\n');
}

function postLines(rows: LlmsPostRow[]): string[] {
  return rows.map((row) => link(row.title, `/${BLOG_PREFIX}/${row.fullPath}`, row.description));
}

function header(): string {
  return [`# ${SITE_NAME}`, `> ${LLMS_SUMMARY}`, LLMS_DETAILS].join('\n\n');
}

function toDate(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

async function postBodyToMarkdown(): Promise<(row: LlmsFullPostRow) => Promise<string>> {
  const payload = await getPayload({ config });
  const field = payload.collections.posts.config.fields.find(
    (candidate): candidate is RichTextField => 'name' in candidate && candidate.name === 'body'
  );

  if (!field) throw new Error('Posts collection has no body field');

  const editorConfig = editorConfigFactory.fromField({ field });
  const siteUrl = getSiteUrl();

  return async (row) => {
    const data = (await populateLexicalUploads(row.body)) as unknown as Parameters<
      typeof convertLexicalToMarkdown
    >[0]['data'];

    return convertLexicalToMarkdown({ data, editorConfig })
      .replace(/\]\(\//g, `](${siteUrl}/`)
      .trim();
  };
}

async function fullPost(row: LlmsFullPostRow, toMarkdown: (row: LlmsFullPostRow) => Promise<string>): Promise<string> {
  const meta = [
    `URL: ${toAbsoluteUrl(`/${BLOG_PREFIX}/${row.fullPath}`)}`,
    `Category: ${row.categoryTitles.join(' > ')}`,
    ...(row.authorNames.length ? [`Authors: ${row.authorNames.join(', ')}`] : []),
    `Published: ${toDate(row.publishedAt)}`,
    ...(row.updatedAt && toDate(row.updatedAt) !== toDate(row.publishedAt)
      ? [`Updated: ${toDate(row.updatedAt)}`]
      : []),
  ];

  return [`# ${inline(row.title)}`, meta.join('\n'), `> ${inline(row.description)}`, await toMarkdown(row)].join(
    '\n\n'
  );
}

export async function generateLlmsFullTxt(): Promise<string> {
  const [rows, toMarkdown] = await Promise.all([getLlmsFullPosts(), postBodyToMarkdown()]);
  const posts = await Promise.all(rows.map((row) => fullPost(row, toMarkdown)));

  return [header(), ...posts].join('\n\n---\n\n') + '\n';
}

export async function generateLlmsTxt(): Promise<string> {
  const [rootCategories, posts, authors] = await Promise.all([getRootCategories(), getLlmsPosts(), getLlmsAuthors()]);

  const rootIds = new Set(rootCategories.map((category) => category.id));

  const categorySections = rootCategories.flatMap((category) => {
    const categoryPosts = posts.filter((post) => post.rootId === category.id);
    if (!categoryPosts.length) return [];

    const categoryLine = category.noIndex
      ? []
      : [link(`${category.title} (category index)`, `/${BLOG_PREFIX}/${category.slug}`, category.seoDescription)];

    return [section(category.title, [...categoryLine, ...postLines(categoryPosts)])];
  });

  const otherPosts = posts.filter((post) => !rootIds.has(post.rootId));

  const sections = [
    ...categorySections,
    ...(otherPosts.length ? [section('More posts', postLines(otherPosts))] : []),
    section('Authors', [
      link('About', '/about', `Who writes ${SITE_NAME} and how we work.`),
      ...authors.map((author) => link(author.name, `/${AUTHOR_PREFIX}/${author.slug}`, author.jobTitle)),
    ]),
    section('Optional', [
      link('Full text of all posts', '/llms-full.txt', 'Every post above as Markdown in a single file.'),
      link('All categories', `/${BLOG_PREFIX}`),
      link('Contact', '/contact'),
      link('Privacy Policy', '/privacy-policy'),
      link('Terms of Use', '/terms'),
    ]),
  ];

  return [header(), ...sections].join('\n\n') + '\n';
}
