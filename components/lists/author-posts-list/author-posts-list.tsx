import Link from 'next/link';
import { type Post } from '@/lib/actions/types/post';
import Pager from '@/components/blocks/pager/pager';
import { POSTS_PER_PAGE, BLOG_PREFIX } from '@/config';
import styles from './author-posts-list.module.scss';

type PropsType = {
  posts: Post[];
  page: number;
  totalCount: number;
};

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AuthorPostsList(props: PropsType) {
  const { posts, page, totalCount } = props;

  if (totalCount === 0) {
    return <p className={styles.empty}>No published articles yet.</p>;
  }

  return (
    <div className={styles.list}>
      {posts.map((post, index) => {
        const isLast = index === posts.length - 1;
        const href = `/${BLOG_PREFIX}/${post.path}`;
        const categorySlugs = post.path?.split('/').slice(0, -1) ?? [];

        return (
          <article key={post.id} className={`${styles.entry} ${isLast ? styles.entryLast : ''}`}>
            {post.categoryTitle && (
              <Link href={`/${BLOG_PREFIX}/${categorySlugs.join('/')}`} className={styles.entryCategory}>
                {post.categoryTitle}
              </Link>
            )}
            <Link href={href} className={styles.entryLink}>
              <h2 className={styles.entryTitle}>{post.title}</h2>
            </Link>
            <p className={styles.entryTeaser}>{post.teaser}</p>
            <div className={styles.entryFooter}>
              <Link href={href} className={styles.readMore}>
                Read More
                <svg
                  className={styles.readMoreIcon}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <time className={styles.entryDate} dateTime={new Date(post.createdAt).toISOString()}>
                {formatDate(post.createdAt)}
              </time>
            </div>
          </article>
        );
      })}
      <Pager page={page} pageLength={POSTS_PER_PAGE} totalLength={totalCount} />
    </div>
  );
}
