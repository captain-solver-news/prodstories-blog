import { notFound } from 'next/navigation';
import CategoryBrowser from '@/components/lists/category-browser/category-browser';
import getCategoryView from '@/lib/actions/get-category-view';
import type { categories } from '@/lib/payload/generated-schema';
import getSubcategoriesByCategoryId from '@/lib/actions/get-subcategories-by-category-id';
import Pager from '@/components/blocks/pager/pager';
import { SUBCATEGORIES_PER_PAGE, BLOG_PREFIX } from '@/config';
import styles from './subcategories-list.module.scss';

type PropsType = {
  category: typeof categories.$inferSelect;
  page: number;
  slugs: string[];
};

export default async function SubcategoriesList(props: PropsType) {
  const { category, page, slugs } = props;
  const [{ subcategories, totalCount }, initialView] = await Promise.all([
    getSubcategoriesByCategoryId(category.id, page),
    getCategoryView(),
  ]);

  if (totalCount === 0) {
    notFound();
  }

  const parentCategoryPath = `/${BLOG_PREFIX}/${slugs.join('/')}`;

  return (
    <div className={styles.list}>
      <CategoryBrowser categories={subcategories} basePath={parentCategoryPath} initialView={initialView} />
      <Pager page={page} pageLength={SUBCATEGORIES_PER_PAGE} totalLength={totalCount} />
    </div>
  );
}
