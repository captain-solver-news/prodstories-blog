import type { AdminViewServerProps } from 'payload';
import { DefaultTemplate } from '@payloadcms/next/templates';
import { redirect } from 'next/navigation';
import { getSiteUrl } from '@/lib/seo/url';
import { BackupsPanel } from './backups-panel';

export function BackupsView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, locale, permissions, visibleEntities } = initPageResult;

  if (req.user?.collection !== 'users') redirect(`${req.payload.config.routes.admin}/login`);

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user}
      visibleEntities={visibleEntities}
    >
      <BackupsPanel apiRoute={req.payload.config.routes.api} source={getSiteUrl()} />
    </DefaultTemplate>
  );
}
