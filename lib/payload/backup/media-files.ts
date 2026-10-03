import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BlobNotFoundError, head, put } from '@vercel/blob';
import type { Payload } from 'payload';
import { sanitizeFilename } from 'payload/shared';

const COLLECTION = 'media';
const CONCURRENCY = 5;
const CACHE_MAX_AGE = 60 * 60 * 24 * 365;

export type FileSource = {
  blobBaseUrl: string | null;
};

export type FilesSummary = {
  copied: number;
  skipped: number;
};

type MediaRow = {
  filename: string | null;
  prefix: string | null;
  url: string | null;
  mime_type: string | null;
};

type StoredFile = {
  filename: string;
  key: string;
  mimeType: string | undefined;
};

export function currentFileSource(): FileSource {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const storeId = token?.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1]?.toLowerCase();

  if (!storeId) return { blobBaseUrl: null };

  return {
    blobBaseUrl: process.env.STORAGE_VERCEL_BLOB_BASE_URL || `https://${storeId}.public.blob.vercel-storage.com`,
  };
}

function storedFiles(payload: Payload, rows: MediaRow[]): StoredFile[] {
  const filePath = `${payload.config.routes.api}/${COLLECTION}/file/`;

  return rows
    .filter((row): row is MediaRow & { filename: string } => Boolean(row.filename))
    .filter(({ url }) => !url || new URL(url, 'http://localhost').pathname.startsWith(filePath))
    .map(({ filename, prefix, mime_type }) => ({
      filename,
      key: path.posix.join(prefix || COLLECTION, sanitizeFilename(filename)),
      mimeType: mime_type ?? undefined,
    }));
}

function blobUrl(baseUrl: string, key: string): string {
  return `${baseUrl}/${path.posix.dirname(key)}/${encodeURIComponent(path.posix.basename(key))}`;
}

function localPath(payload: Payload, filename: string): string {
  const staticDir = payload.collections[COLLECTION].config.upload.staticDir || COLLECTION;

  return path.resolve(staticDir, filename);
}

async function exists(payload: Payload, target: FileSource, file: StoredFile): Promise<boolean> {
  if (!target.blobBaseUrl) {
    return access(localPath(payload, file.filename)).then(
      () => true,
      () => false
    );
  }

  try {
    await head(blobUrl(target.blobBaseUrl, file.key), { token: process.env.BLOB_READ_WRITE_TOKEN });

    return true;
  } catch (error) {
    if (error instanceof BlobNotFoundError) return false;
    throw error;
  }
}

async function read(payload: Payload, source: FileSource, file: StoredFile): Promise<Buffer> {
  if (!source.blobBaseUrl) return readFile(localPath(payload, file.filename));

  const response = await fetch(blobUrl(source.blobBaseUrl, file.key));
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  return Buffer.from(await response.arrayBuffer());
}

async function write(payload: Payload, target: FileSource, file: StoredFile, body: Buffer): Promise<void> {
  if (!target.blobBaseUrl) {
    const filePath = localPath(payload, file.filename);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, body);

    return;
  }

  await put(file.key, body, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: CACHE_MAX_AGE,
    contentType: file.mimeType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

export async function copyMediaFiles(
  payload: Payload,
  source: FileSource,
  rows: Record<string, unknown>[]
): Promise<FilesSummary> {
  const target = currentFileSource();
  const files = storedFiles(payload, rows as MediaRow[]);

  if (source.blobBaseUrl && source.blobBaseUrl === target.blobBaseUrl) return { copied: 0, skipped: files.length };

  const summary: FilesSummary = { copied: 0, skipped: 0 };
  const failures: string[] = [];
  const queue = [...files];

  const worker = async () => {
    for (let file = queue.shift(); file; file = queue.shift()) {
      try {
        if (await exists(payload, target, file)) {
          summary.skipped++;
          continue;
        }

        await write(payload, target, file, await read(payload, source, file));
        summary.copied++;
      } catch (error) {
        failures.push(`${file.key} (${error instanceof Error ? error.message : error})`);
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  if (failures.length) {
    const from = source.blobBaseUrl ?? 'the local media folder';
    const listed = failures.slice(0, 10).join(', ');
    const more = failures.length > 10 ? ` and ${failures.length - 10} more` : '';

    throw new Error(
      `Could not copy ${failures.length} media file(s) from ${from}: ${listed}${more}. The database was not changed.`
    );
  }

  return summary;
}
