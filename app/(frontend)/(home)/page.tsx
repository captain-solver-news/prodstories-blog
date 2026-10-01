export { homeMetadata as metadata } from '@/lib/seo/static';
import { homeSchema } from '@/lib/seo/static';
import { JsonLd } from '@/components/seo/json-ld';
import styles from './page.module.scss';
import Image from 'next/image';
import getFeaturedPosts from '@/lib/actions/get-featured-posts';
import Link from 'next/link';
import { Container } from '@/components/primitives/container/container';
import { CodeTyper } from '@/components/blocks/code-typer/code-typer';

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts();

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.gridBg} aria-hidden="true" />
        <Container size="shell" className={styles.heroInner}>
          <div className={styles.content}>
            <span className={styles.badge}>Independent engineering journal</span>
            <h1 className={styles.title}>
              Engineering stories from developers <span className={styles.accent}>building in public.</span>
            </h1>
            <p className={styles.description}>
              We share our experience from real projects: what we built, broke, and fixed. The reasoning, the numbers,
              and the parts that failed.
            </p>
            <div className={styles.actions}>
              <a href="#featured" className={styles.btnPrimary}>
                Read the latest posts <span aria-hidden="true">↗</span>
              </a>
              <Link href="/blog" className={styles.btnSecondary}>
                Browse all posts
              </Link>
            </div>
            <p className={styles.heroNote}>Written by engineers. Grounded in production.</p>
          </div>
          <CodeTyper className={styles.codeBlock} />
        </Container>
      </section>

      <section className={styles.metrics}>
        <Container size="shell">
          <div className={styles.metricsHeader}>
            <span className={styles.eyebrow}>01 / How we write</span>
            <h2 className={styles.sectionTitle}>Every post is checked before it ships</h2>
            <p className={styles.sectionSubtitle}>Three rules we hold every article to</p>
          </div>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <Image src="/icons/Homepage-1.svg" alt="" width="18" height="18" />
              </div>
              <h3 className={styles.metricTitle}>First-hand only</h3>
              <p className={styles.metricDesc}>
                We only write about tools we&apos;ve run in a real project. Every post comes with evidence: code,
                screenshots, timings, and costs.
              </p>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <Image src="/icons/Homepage-2.svg" alt="" width="20" height="20" />
              </div>
              <h3 className={styles.metricTitle}>Failures stay in</h3>
              <p className={styles.metricDesc}>
                When something broke or didn&apos;t work, we keep it in the post. The dead end is often the most useful
                part, because now you can skip it.
              </p>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <Image src="/icons/Homepage-3.svg" alt="" width="16" height="20" />
              </div>
              <h3 className={styles.metricTitle}>Reviewed, and labeled honestly</h3>
              <p className={styles.metricDesc}>
                Our Reviewer skill checks each article for real experience and evidence. When we&apos;re still learning
                a topic, we say so.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.authors}>
        <Container size="shell" className={styles.authorsInner}>
          <div className={styles.authorsCopy}>
            <span className={styles.eyebrow}>02 / Who we write for</span>
            <h2 className={styles.sectionTitle}>For developers who build their own products</h2>
            <p className={styles.sectionBody}>
              We write for engineers who ship alone or in a pair, with no colleague to argue a decision with. Think of
              each post as a second opinion from someone who already tried it.
            </p>
            <Link href="/about" className={styles.learnMore}>
              Learn more about us
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
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className={styles.checkList}>
            <div className={styles.checkItem}>
              <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <div>
                <p className={styles.checkTitle}>The reasoning, not just the config</p>
                <p className={styles.checkDesc}>
                  Why we chose it, what we rejected, and what we&apos;d do differently.
                </p>
              </div>
            </div>
            <div className={styles.checkItem}>
              <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <div>
                <p className={styles.checkTitle}>Numbers, not adjectives</p>
                <p className={styles.checkDesc}>Timings, costs, and what it took to make it work.</p>
              </div>
            </div>
            <div className={styles.checkItem}>
              <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <div>
                <p className={styles.checkTitle}>Ideas you can use the same evening</p>
                <p className={styles.checkDesc}>Techniques you can read, understand, and adapt in your own repo.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="featured" className={styles.featured}>
        <Container size="shell">
          <div className={styles.featuredHeader}>
            <div>
              <span className={styles.eyebrow}>03 / Selected reading</span>
              <h2 className={styles.sectionTitle}>Featured Posts</h2>
            </div>
            <Link href="/blog" className={styles.viewAll}>
              <span className={styles.viewAllLabel}>
                View All Posts
                <span className={styles.viewAllArrow} aria-hidden="true">
                  ↗
                </span>
              </span>
            </Link>
          </div>
          <div className={styles.featuredList}>
            {featuredPosts.map((post) => {
              const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const authorsNames = post.authors?.length ? post.authors.map((a) => a.name).join(', ') : 'Anonymous';

              return (
                <Link key={post.id} href={`/blog/${post.path}`} className={styles.postCardLink}>
                  <article className={styles.postCard}>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <p className={styles.postExcerpt}>{post.teaser}</p>

                    <div className={styles.postMeta}>
                      <span className={styles.postAuthor}>{authorsNames}</span>
                      <span className={styles.postDot}>•</span>
                      <span className={styles.postDate}>{formattedDate}</span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <JsonLd schema={homeSchema} />
    </>
  );
}
