import { generateSitemapXml } from '@/lib/seo/sitemap';

export const dynamic = 'force-static';

export async function GET(): Promise<Response> {
  return new Response(await generateSitemapXml(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
