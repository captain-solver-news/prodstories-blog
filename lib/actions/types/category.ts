import type { categories } from '@/lib/payload/generated-schema';

export type CategoryPreview = Pick<typeof categories.$inferSelect, 'id' | 'title' | 'slug'> & {
  coverUrl: string | null;
  coverAlt: string | null;
};

export type Category = typeof categories.$inferSelect & {
  ogImage: string | null;
  lastModified: string;
};
