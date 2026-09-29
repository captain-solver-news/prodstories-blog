import { sql } from 'drizzle-orm';
import { categories, posts } from '@/lib/payload/generated-schema';
import { Status, Type } from '@/lib/payload/taxonomy';
import timestampToDate from '../utils/timestamp-to-date';
import { getPayload } from 'payload';
import config from '@payload-config';

export type SitemapPostRow = {
  fullPath: string;
  updatedAt: Date | null;
};

type SitemapPostQueryRow = {
  fullPath: string;
  updatedAt: string | null;
  type: string;
  status: string;
  noIndex: boolean | null;
};

export default async function getSitemapPosts(): Promise<SitemapPostRow[]> {
  const db = (await getPayload({ config })).db.drizzle;

  const { rows } = await db.execute<SitemapPostQueryRow>(sql`
    WITH RECURSIVE category_tree AS (
      SELECT
        ${categories.id} AS id,
        ${categories.type} AS type,
        ${categories.slug}::text AS full_path
      FROM ${categories}
      WHERE ${categories.parent} IS NULL

      UNION ALL

      SELECT
        ${categories.id},
        ${categories.type},
        (ct.full_path || '/' || ${categories.slug})::text AS full_path
      FROM ${categories}
      JOIN category_tree ct ON ${categories.parent} = ct.id
    )
    SELECT
      (ct.full_path || '/' || ${posts.slug})::text AS "fullPath",
      ${posts.contentUpdatedAt} AS "updatedAt",
      ct.type AS "type",
      ${posts.status} AS "status",
      ${posts.noIndex} AS "noIndex"
    FROM ${posts}
    JOIN category_tree ct ON ${posts.category} = ct.id;
  `);

  return rows
    .filter((row) => row.type !== Type.Hidden && row.status === Status.Published && row.noIndex !== true)
    .map((row) => ({
      fullPath: row.fullPath,
      updatedAt: row.updatedAt ? timestampToDate(row.updatedAt) : null,
    }));
}
