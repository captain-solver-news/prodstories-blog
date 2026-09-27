'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Grid2X2, List } from 'lucide-react';
import type { CategoryPreview } from '@/lib/actions/types/category';
import styles from './category-browser.module.scss';

type Props = {
  categories: CategoryPreview[];
  basePath: string;
  initialView: 'grid' | 'list';
};

function CategoryCover({ category }: { category: CategoryPreview }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const initials = category.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('');

  return (
    <div className={styles.cover}>
      <div className={styles.placeholder} aria-hidden="true">
        <span>{initials}</span>
      </div>
      {category.coverUrl && category.coverUrl !== failedUrl && (
        <Image
          src={category.coverUrl}
          alt={category.coverAlt ?? ''}
          fill
          sizes="(max-width: 599px) 100vw, (max-width: 899px) 50vw, 320px"
          className={styles.image}
          onError={() => setFailedUrl(category.coverUrl)}
        />
      )}
    </div>
  );
}

export default function CategoryBrowser({ categories, basePath, initialView }: Props) {
  const [view, setView] = useState(initialView);
  const listId = useId();

  function changeView(nextView: 'grid' | 'list') {
    setView(nextView);
    document.cookie = `category-view=${nextView}; path=/; max-age=31536000; SameSite=Lax`;
  }

  return (
    <section className={styles.browser} aria-label="Browse categories" data-view={view}>
      <div className={styles.toolbar}>
        <h2 className={styles.label}>
          Explore categories <span className={styles.count}>{categories.length}</span>
        </h2>
        <div className={styles.toggle} role="group" aria-label="Category view">
          <button
            type="button"
            aria-pressed={view === 'grid'}
            aria-controls={listId}
            onClick={() => changeView('grid')}
          >
            <Grid2X2 size={16} aria-hidden="true" />
            <span>Grid</span>
          </button>
          <button
            type="button"
            aria-pressed={view === 'list'}
            aria-controls={listId}
            onClick={() => changeView('list')}
          >
            <List size={18} aria-hidden="true" />
            <span>List</span>
          </button>
        </div>
      </div>
      {categories.length ? (
        <ul id={listId} className={styles.collection}>
          {categories.map((category, index) => (
            <li key={category.id} className={styles.item}>
              <Link href={`${basePath}/${category.slug}`} className={styles.card}>
                <CategoryCover category={category} />
                <div className={styles.details}>
                  <span className={styles.number} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className={styles.title}>{category.title}</h3>
                  <span className={styles.explore}>Explore category</span>
                  <span className={styles.arrow} aria-hidden="true">
                    <ArrowUpRight size={20} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p id={listId} className={styles.empty}>
          New categories are on the way. Check back soon.
        </p>
      )}
    </section>
  );
}
