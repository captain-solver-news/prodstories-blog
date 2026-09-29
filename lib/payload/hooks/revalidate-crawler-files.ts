import { revalidatePath, revalidateTag } from 'next/cache';
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload';

function revalidate(req: PayloadRequest): void {
  try {
    revalidatePath('/llms.txt');
    revalidatePath('/llms-full.txt');
    revalidatePath('/sitemap.xml');
    revalidateTag('sitemap-data', { expire: 0 });
  } catch (error) {
    req.payload.logger.warn(`Skipped revalidation: ${error instanceof Error ? error.message : error}`);
  }
}

export const revalidateCrawlerFilesAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  revalidate(req);

  return doc;
};

export const revalidateCrawlerFilesAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidate(req);

  return doc;
};
