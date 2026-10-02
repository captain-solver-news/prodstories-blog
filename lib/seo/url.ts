import { isProduction } from '@/lib/env';

export function getSiteUrl(): string {
  return process.env.PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export function toAbsoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}

export function toCanonicalPath(path: string): string | undefined {
  return isProduction() ? path : undefined;
}
