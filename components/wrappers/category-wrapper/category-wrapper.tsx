import { type ReactNode } from 'react';
import Link from 'next/link';
import styles from './category-wrapper.module.scss';
import { Container } from '@/components/primitives/container/container';
import { type CategoryBreadcrumb } from '@/lib/actions/get-category-breadcrumbs';

type PropsType = {
  title: string;
  description?: string | null;
  breadcrumbs: CategoryBreadcrumb[];
  children?: ReactNode;
};

export default async function CategoryWrapper(props: PropsType) {
  const { title, description, breadcrumbs, children } = props;

  return (
    <Container className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/blog" className={styles.breadcrumbLink}>
            Blog
          </Link>
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            const href = `/blog/${crumb.fullPath}`;
            return (
              <span key={crumb.fullPath} className={styles.breadcrumbItem}>
                <span className={styles.breadcrumbSeparator} aria-hidden="true">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
                {isLast ? (
                  <span className={styles.breadcrumbCurrent}>{crumb.title}</span>
                ) : (
                  <Link href={href} className={styles.breadcrumbLink}>
                    {crumb.title}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>

        <h1 className={styles.title}>{title}</h1>

        {description && <p className={styles.description}>{description}</p>}
      </header>

      {children}
    </Container>
  );
}
