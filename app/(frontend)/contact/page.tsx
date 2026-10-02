export { contactMetadata as metadata } from '@/lib/seo/static';
import { JsonLd } from '@/components/seo/json-ld';
import { contactSchema } from '@/lib/seo/static';
import Image from 'next/image';
import { POST_CONTENT_IMAGE_SIZES } from '@/config';
import getStaticContent from '@/lib/actions/get-static-content';
import getDbConfigs from '@/lib/actions/get-db-configs';
import LinkedInContact from '@/components/icons/linkedin-contact';
import XContact from '@/components/icons/x-contact';
import styles from './page.module.scss';
import { StaticPage } from '@/components/wrappers/static-page/static-page';

export default async function ContactPage() {
  const content = await getStaticContent('contact');
  const configs = await getDbConfigs(['contact-email', 'social-link-linkedin', 'social-link-x']);
  const email = configs.find((c) => c.id === 'contact-email')?.value ?? 'hello@dev-signal.com';
  const linkedinUrl = configs.find((c) => c.id === 'social-link-linkedin')?.value ?? '#';
  const xUrl = configs.find((c) => c.id === 'social-link-x')?.value ?? '#';

  return (
    <>
      <StaticPage title={content.title} body={content.body}>
        <div className={styles.grid}>
          <a href={`mailto:${email}`} className={styles.socialCard}>
            <div className={styles.cardInner}>
              <div className={`${styles.iconBox} ${styles.iconBoxBorder}`}>
                <svg
                  className={styles.icon}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div className={styles.cardText}>
                <p className={styles.cardLabel}>Direct Inquiries</p>
                <p className={styles.cardTitle}>{email}</p>
              </div>
            </div>
          </a>
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className={styles.socialCard}>
            <div className={styles.cardInner}>
              <div className={`${styles.iconBox} ${styles.iconBoxBorder}`}>
                <LinkedInContact className={styles.icon} aria-hidden="true" />
              </div>
              <div className={styles.cardText}>
                <p className={styles.cardLabel}>Official Page</p>
                <p className={styles.cardTitle}>LinkedIn</p>
              </div>
            </div>
          </a>
          <a href={xUrl} target="_blank" rel="noopener noreferrer" className={styles.socialCard}>
            <div className={styles.cardInner}>
              <div className={`${styles.iconBox} ${styles.iconBoxBorder}`}>
                <XContact className={styles.icon} aria-hidden="true" />
              </div>
              <div className={styles.cardText}>
                <p className={styles.cardLabel}>Latest Updates</p>
                <p className={styles.cardTitle}>Twitter / X</p>
              </div>
            </div>
          </a>
        </div>

        <div className={styles.imageWrapper}>
          <Image
            className={styles.image}
            src="/images/contact-keyboard.png"
            alt="A macro shot of a mechanical keyboard on a dark desk, illuminated by the green glow of an ultra-wide monitor in a dimly lit studio"
            fill
            sizes={POST_CONTENT_IMAGE_SIZES}
          />
          <div className={styles.imageOverlay} />
        </div>
      </StaticPage>
      <JsonLd schema={contactSchema} />
    </>
  );
}
