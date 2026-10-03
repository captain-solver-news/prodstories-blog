import type { posts } from '@/lib/payload/generated-schema';
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical';
import type { Author } from './author';

export type Post = Omit<typeof posts.$inferSelect, 'body'> & {
  body: DefaultTypedEditorState;
  ogImage: string | null;
  authors: Author[];
  path?: string;
  categoryTitle?: string;
};
