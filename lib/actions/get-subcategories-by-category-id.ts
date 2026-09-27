import { categories, media } from '@/lib/payload/generated-schema';
import { Type } from '@/lib/payload/taxonomy';
import { eq, asc, sql, and, ne } from 'drizzle-orm';
import type { CategoryPreview } from './types/category';
import { SUBCATEGORIES_PER_PAGE } from '@/config';
import { getPayload } from 'payload';
import config from '@payload-config';

export default async function getSubcategoriesByCategoryId(
  categoryId: string,
  page: number
): Promise<{ subcategories: CategoryPreview[]; totalCount: number }> {
  const db = (await getPayload({ config })).db.drizzle;

  const result = await db
    .select({
      id: categories.id,
      title: categories.title,
      slug: categories.slug,
      coverUrl: media.url,
      coverAlt: media.alt,
      totalCount: sql<number>`count(*) OVER()`.mapWith(Number),
    })
    .from(categories)
    .leftJoin(media, eq(categories.coverImage, media.id))
    .where(and(eq(categories.parent, categoryId), ne(categories.type, Type.Hidden)))
    .orderBy(asc(categories.weight))
    .limit(SUBCATEGORIES_PER_PAGE)
    .offset((page - 1) * SUBCATEGORIES_PER_PAGE);

  return {
    subcategories: result.map(({ id, title, slug, coverUrl, coverAlt }) => ({ id, title, slug, coverUrl, coverAlt })),
    totalCount: result.length ? result[0].totalCount : 0,
  };
}
