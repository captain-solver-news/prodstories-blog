import { sql } from 'drizzle-orm';
import { categories, posts } from '@/lib/payload/generated-schema';
import { Status, Type } from '@/lib/payload/taxonomy';
import timestampToDate from '../utils/timestamp-to-date';
import { getPayload } from 'payload';
import config from '@payload-config';

export type SitemapCategoryRow = {
  fullPath: string;
  updatedAt: Date | null;
};

type SitemapCategoryQueryRow = {
  fullPath: string;
  updatedAt: string | null;
  type: string;
  noIndex: boolean | null;
};

export default async function getSitemapCategories(): Promise<SitemapCategoryRow[]> {
  const db = (await getPayload({ config })).db.drizzle;

  const { rows } = await db.execute<SitemapCategoryQueryRow>(sql`
    WITH RECURSIVE category_tree AS (
      SELECT
        ${categories.id} AS id,
        ${categories.type} AS type,
        ${categories.noIndex} AS no_index,
        ${categories.updatedAt} AS updated_at,
        ${categories.slug}::text AS full_path
      FROM ${categories}
      WHERE ${categories.parent} IS NULL

      UNION ALL

      SELECT
        ${categories.id},
        ${categories.type},
        ${categories.noIndex},
        ${categories.updatedAt},
        (ct.full_path || '/' || ${categories.slug})::text AS full_path
      FROM ${categories}
      JOIN category_tree ct ON ${categories.parent} = ct.id
    ),
    descendants AS (
      SELECT id AS ancestor_id, id FROM category_tree

      UNION ALL

      SELECT d.ancestor_id, ${categories.id}
      FROM ${categories}
      JOIN descendants d ON ${categories.parent} = d.id
    ),
    posts_lastmod AS (
      SELECT
        d.ancestor_id,
        max(${posts.contentUpdatedAt}) AS updated_at
      FROM descendants d
      JOIN ${posts} ON ${posts.category} = d.id
      WHERE ${posts.status} = ${Status.Published}
      GROUP BY d.ancestor_id
    )
    SELECT
      ct.full_path AS "fullPath",
      greatest(ct.updated_at, pl.updated_at) AS "updatedAt",
      ct.type AS "type",
      ct.no_index AS "noIndex"
    FROM category_tree ct
    LEFT JOIN posts_lastmod pl ON pl.ancestor_id = ct.id;
  `);

  return rows
    .filter((row) => row.type !== Type.Hidden && row.noIndex !== true)
    .map((row) => ({
      fullPath: row.fullPath,
      updatedAt: row.updatedAt ? timestampToDate(row.updatedAt) : null,
    }));
}
