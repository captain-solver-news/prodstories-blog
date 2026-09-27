import { cookies } from 'next/headers';

export default async function getCategoryView(): Promise<'grid' | 'list'> {
  return (await cookies()).get('category-view')?.value === 'list' ? 'list' : 'grid';
}
