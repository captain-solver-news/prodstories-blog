export { termsAndConditionsMetadata as metadata } from '@/lib/seo/static';
import { JsonLd } from '@/components/seo/json-ld';
import { termsAndConditionsSchema } from '@/lib/seo/static';
import getStaticContent from '@/lib/actions/get-static-content';
import { StaticPage } from '@/components/wrappers/static-page/static-page';

export default async function TermsAndConditionsPage() {
  const content = await getStaticContent('terms-and-conditions');

  return (
    <>
      <StaticPage title={content.title} body={content.body} />
      <JsonLd schema={termsAndConditionsSchema} />
    </>
  );
}
