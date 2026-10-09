import { posts, posts_rels, authors } from '@/lib/payload/generated-schema';
import { eq, desc, sql, and, getTableColumns } from 'drizzle-orm';
import rowJson from '../utils/row-json';
import { AUTHOR_AVATAR_MEDIA, POST_OG_IMAGE_URL } from '../utils/media-url';
import { Status } from '@/lib/payload/taxonomy';
import type { Author } from './types/author';
import type { Post } from './types/post';
import getPostPath from './get-post-path';
import { getPayload } from 'payload';
import config from '@payload-config';

export default async function getFeaturedPosts(): Promise<Post[]> {
  const db = (await getPayload({ config })).db.drizzle;

  const rows = await db
    .select({
      post: { ...getTableColumns(posts), ...POST_OG_IMAGE_URL },
      authors: sql<
        Author[]
      >`COALESCE(json_agg(${rowJson(authors, AUTHOR_AVATAR_MEDIA)} ORDER BY ${posts_rels.order}) FILTER (WHERE ${authors.id} IS NOT NULL), '[]')`.mapWith(
        (val) => (typeof val === 'string' ? JSON.parse(val) : val)
      ),
    })
    .from(posts)
    .leftJoin(posts_rels, and(eq(posts.id, posts_rels.parent), eq(posts_rels.path, 'authors')))
    .leftJoin(authors, eq(posts_rels.authorsID, authors.id))
    .where(and(eq(posts.status, Status.Published), eq(posts.isFeatured, true)))
    .groupBy(posts.id)
    .orderBy(desc(sql`coalesce(${posts.publishedAt}, ${posts.createdAt})`));

  const featuredPosts = await Promise.all(
    rows.map(async (row) => ({
      ...row.post,
      authors: row.authors,
      path: (await getPostPath(row.post.id)) ?? undefined,
    }))
  );

  return featuredPosts.filter((post) => post.path) as Post[];
}
