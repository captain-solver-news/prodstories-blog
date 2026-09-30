import type { ReactNode } from 'react';
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { Container } from '@/components/primitives/container/container';
import { richTextConverters } from '@/lib/utils/rich-text-converters';
import styles from './static-page.module.scss';

interface StaticPageProps {
  title: string | null;
  body: DefaultTypedEditorState;
  children?: ReactNode;
}

export function StaticPage({ title, body, children }: StaticPageProps) {
  return (
    <Container as="article" className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>{title}</h1>
      </header>
      <RichText className="md-prose" data={body} converters={richTextConverters} />
      {children}
    </Container>
  );
}
