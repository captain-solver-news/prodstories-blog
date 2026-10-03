import { revalidatePath } from 'next/cache';
import type { Endpoint, PayloadHandler, PayloadRequest } from 'payload';
import type { User } from '@/lib/payload/generated-types';
import { getSiteUrl } from '@/lib/seo/url';
import { backupFileName, createBackup, decodeBackup, encodeBackup, restoreBackup } from './backup';

function adminUser(req: PayloadRequest): User | null {
  return req.user?.collection === 'users' ? req.user : null;
}

function forbidden(): Response {
  return Response.json({ error: 'Not allowed.' }, { status: 403 });
}

function revalidateSite(req: PayloadRequest): void {
  try {
    revalidatePath('/', 'layout');
  } catch (error) {
    req.payload.logger.warn(`Skipped revalidation: ${error instanceof Error ? error.message : error}`);
  }
}

const exportHandler: PayloadHandler = async (req) => {
  const user = adminUser(req);
  if (!user) return forbidden();

  const source = getSiteUrl();
  const backup = await createBackup(req.payload, source);
  const body = encodeBackup(backup);

  req.payload.logger.info(`Backup exported by ${user.email}`);

  return new Response(new Uint8Array(body), {
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${backupFileName(source)}"`,
      'Content-Length': String(body.length),
      'Cache-Control': 'no-store',
    },
  });
};

const importHandler: PayloadHandler = async (req) => {
  const user = adminUser(req);
  if (!user || !req.arrayBuffer) return forbidden();

  const includeUsers = req.searchParams.get('users') === '1';

  try {
    const backup = decodeBackup(Buffer.from(await req.arrayBuffer()));
    const summary = await restoreBackup(req.payload, backup, { includeUsers });

    req.payload.logger.info(`Backup from ${backup.source} (${backup.createdAt}) imported by ${user.email}`);
    revalidateSite(req);

    return Response.json({ ...summary, source: backup.source, createdAt: backup.createdAt });
  } catch (error) {
    req.payload.logger.error(error);

    return Response.json({ error: error instanceof Error ? error.message : 'Import failed.' }, { status: 400 });
  }
};

export const backupEndpoints: Endpoint[] = [
  { path: '/backups/export', method: 'get', handler: exportHandler },
  { path: '/backups/import', method: 'post', handler: importHandler },
];
