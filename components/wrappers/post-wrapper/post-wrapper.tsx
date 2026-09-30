import { type Post } from '@/lib/actions/types/post';
import { RichText } from '@payloadcms/richtext-lexical/react';
import styles from './post-wrapper.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/primitives/container/container';
import { AUTHOR_PREFIX, POST_CONTENT_IMAGE_SIZES } from '@/config';
import { richTextConverters } from '@/lib/utils/rich-text-converters';

type PropsType = {
  post: Post;
  categorySlugs: string[];
};

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function PostWrapper({ post, categorySlugs }: PropsType) {
  const publishedAt = post.publishedAt ?? post.createdAt;

  return (
    <Container as="article" className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/blog" className={styles.breadcrumbLink}>
          Blog
        </Link>
        {categorySlugs.map((slug, i) => {
          const isLast = i === categorySlugs.length - 1;
          const label = slug
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          const href = `/blog/${categorySlugs.slice(0, i + 1).join('/')}`;
          return (
            <span key={slug} className={styles.breadcrumbItem}>
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
                <span className={styles.breadcrumbCurrent}>{label}</span>
              ) : (
                <a href={href} className={styles.breadcrumbLink}>
                  {label}
                </a>
              )}
            </span>
          );
        })}
      </nav>

      <h1 className={styles.title}>{post.title}</h1>

      <time className={styles.date} dateTime={new Date(publishedAt).toISOString()}>
        {formatDate(publishedAt)}
      </time>

      {post.ogImage && (
        <figure className={styles.featuredImage}>
          <div className={styles.imageWrapper}>
            <Image
              className={styles.image}
              src={post.ogImage}
              alt={post.title}
              fill
              sizes={POST_CONTENT_IMAGE_SIZES}
              priority
            />
          </div>
        </figure>
      )}

      <RichText className="md-prose" data={post.body} converters={richTextConverters} />

      <div className={styles.footer}>
        {post.authors.map((author) => (
          <Link key={author.id} href={`/${AUTHOR_PREFIX}/${author.slug}`} className={styles.footerAuthor}>
            {author.miniAvatarMedia?.url && (
              <Image
                src={author.miniAvatarMedia.url}
                alt={author.name}
                width={48}
                height={48}
                className={styles.footerAvatar}
              />
            )}
            <div>
              <p className={styles.footerAuthorName}>{author.name}</p>
              <p className={styles.footerAuthorRole}>{author.jobTitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
