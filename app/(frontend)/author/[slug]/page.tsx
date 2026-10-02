import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import getAuthorBySlug from '@/lib/actions/get-author-by-slug';
import getPostsByAuthorId from '@/lib/actions/get-posts-by-author-id';
import { generateAuthorMetadata, generateAuthorSchema } from '@/lib/seo/author';
import { JsonLd } from '@/components/seo/json-ld';
import AuthorWrapper from '@/components/wrappers/author-wrapper/author-wrapper';
import AuthorPostsList from '@/components/lists/author-posts-list/author-posts-list';

type PropsType = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page: string }>;
};

const getAuthorBySlugCached = cache(getAuthorBySlug);

export async function generateMetadata(props: PropsType): Promise<Metadata> {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;

  const author = await getAuthorBySlugCached(slug);
  if (!author) {
    return {};
  }

  return generateAuthorMetadata(author, page);
}

export default async function AuthorPage(props: PropsType) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;

  const author = await getAuthorBySlugCached(slug);
  if (!author) {
    notFound();
  }

  const { posts, totalCount } = await getPostsByAuthorId(author.id, page);

  // An author with no posts still gets a page; a page number past the last one does not.
  if (page > 1 && posts.length === 0) {
    notFound();
  }

  return (
    <>
      <AuthorWrapper author={author} totalCount={totalCount}>
        <AuthorPostsList posts={posts} page={page} totalCount={totalCount} />
      </AuthorWrapper>
      <JsonLd schema={generateAuthorSchema(author)} />
    </>
  );
}
