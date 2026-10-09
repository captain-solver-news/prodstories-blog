import { sql } from 'drizzle-orm';
import { POSTS_PER_PAGE } from '@/config';
import { categories, posts, posts_rels, authors } from '@/lib/payload/generated-schema';
import rowJson from '../utils/row-json';
import { AUTHOR_AVATAR_MEDIA, POST_OG_IMAGE_URL } from '../utils/media-url';
import { Status } from '@/lib/payload/taxonomy';
import type { Author } from './types/author';
import type { Post } from './types/post';
import { getPayload } from 'payload';
import config from '@payload-config';

type PostQueryRow = {
  post: Omit<Post, 'authors' | 'path' | 'categoryTitle'>;
  path: string;
  categoryTitle: string;
  authors: Author[] | string;
  totalCount: number;
};

export default async function getPostsByAuthorId(
  authorId: string,
  page: number
): Promise<{ posts: Post[]; totalCount: number }> {
  const db = (await getPayload({ config })).db.drizzle;

  const { rows } = await db.execute<PostQueryRow>(sql`
    WITH RECURSIVE category_tree AS (
      SELECT
        ${categories.id} AS id,
        ${categories.title}::text AS title,
        ${categories.slug}::text AS full_path
      FROM ${categories}
      WHERE ${categories.parent} IS NULL

      UNION ALL

      SELECT
        ${categories.id},
        ${categories.title}::text,
        (ct.full_path || '/' || ${categories.slug})::text AS full_path
      FROM ${categories}
      JOIN category_tree ct ON ${categories.parent} = ct.id
    )
    SELECT
      ${rowJson(posts, POST_OG_IMAGE_URL)} AS post,
      (ct.full_path || '/' || ${posts.slug})::text AS "path",
      ct.title AS "categoryTitle",
      COALESCE(
        (
          SELECT json_agg(${rowJson(authors, AUTHOR_AVATAR_MEDIA)} ORDER BY pr_all."order")
          FROM ${posts_rels} pr_all
          JOIN ${authors} ON ${authors.id} = pr_all.authors_id
          WHERE pr_all.parent_id = ${posts.id}
            AND pr_all.path = 'authors'
        ),
        '[]'::json
      ) AS "authors",
      (count(*) OVER())::int AS "totalCount"
    FROM ${posts}
    JOIN category_tree ct ON ${posts.category} = ct.id
    WHERE ${posts.status} = ${Status.Published}
      AND EXISTS (
        SELECT 1
        FROM ${posts_rels} pr
        WHERE pr.parent_id = ${posts.id}
          AND pr.path = 'authors'
          AND pr.authors_id = ${authorId}
      )
    ORDER BY coalesce(${posts.publishedAt}, ${posts.createdAt}) DESC
    LIMIT ${POSTS_PER_PAGE}
    OFFSET ${(page - 1) * POSTS_PER_PAGE};
  `);

  return {
    posts: rows.map((row) => ({
      ...row.post,
      authors: typeof row.authors === 'string' ? JSON.parse(row.authors) : row.authors,
      path: row.path,
      categoryTitle: row.categoryTitle,
    })),
    totalCount: rows.length ? rows[0].totalCount : 0,
  };
}
