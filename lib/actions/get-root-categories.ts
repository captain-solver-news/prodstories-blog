import { categories, media } from '@/lib/payload/generated-schema';
import { Type } from '@/lib/payload/taxonomy';
import { asc, isNull, and, ne, eq, getTableColumns } from 'drizzle-orm';
import type { CategoryPreview } from './types/category';
import { getPayload } from 'payload';
import config from '@payload-config';

export default async function getRootCategories(): Promise<(typeof categories.$inferSelect & CategoryPreview)[]> {
  const db = (await getPayload({ config })).db.drizzle;

  return db
    .select({
      ...getTableColumns(categories),
      coverUrl: media.url,
      coverAlt: media.alt,
    })
    .from(categories)
    .leftJoin(media, eq(categories.coverImage, media.id))
    .where(and(isNull(categories.parent), ne(categories.type, Type.Hidden)))
    .orderBy(asc(categories.weight));
}
