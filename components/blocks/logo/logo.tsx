import Link from 'next/link';
import Wordmark from './logo.svg?react';
import styles from './logo.module.scss';

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = '/', className }: LogoProps) {
  return (
    <Link href={href} aria-label="ProdStories — home" className={[styles.logo, className].filter(Boolean).join(' ')}>
      <Wordmark className={styles.wordmark} aria-hidden="true" />
    </Link>
  );
}
