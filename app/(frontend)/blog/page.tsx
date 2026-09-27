import getRootCategories from '@/lib/actions/get-root-categories';
import getCategoryView from '@/lib/actions/get-category-view';
import CategoryBrowser from '@/components/lists/category-browser/category-browser';
import { BLOG_PREFIX } from '@/config';
export { blogMetadata as metadata } from '@/lib/seo/static';
import { JsonLd } from '@/components/seo/json-ld';
import { blogSchema } from '@/lib/seo/static';
import styles from './page.module.scss';
import { Container } from '@/components/primitives/container/container';

export default async function BlogPage() {
  const [categories, initialView] = await Promise.all([getRootCategories(), getCategoryView()]);

  return (
    <>
      <Container as="article" className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Blog</h1>
          <p className={styles.intro}>Ideas, experiments, and things worth building.</p>
        </header>
        <CategoryBrowser
          categories={categories.map(({ id, title, slug, coverUrl, coverAlt }) => ({
            id,
            title,
            slug,
            coverUrl,
            coverAlt,
          }))}
          basePath={`/${BLOG_PREFIX}`}
          initialView={initialView}
        />
      </Container>
      <JsonLd schema={blogSchema} />
    </>
  );
}
