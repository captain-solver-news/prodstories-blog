'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import styles from './backups-panel.module.scss';

type PropsType = {
  apiRoute: string;
  source: string;
};

type ImportResult = {
  source: string;
  createdAt: string;
  includeUsers: boolean;
  tables: Record<string, number>;
  files: { copied: number; skipped: number };
};

type Status =
  | { type: 'idle' }
  | { type: 'working'; message: string }
  | { type: 'error'; message: string }
  | { type: 'done'; result: ImportResult };

const BUTTON = 'btn btn--style-primary btn--size-medium btn--withoutPopup';
const SECONDARY_BUTTON = 'btn btn--style-secondary btn--size-medium btn--withoutPopup';

function fileNameFrom(response: Response): string {
  const match = response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/);

  return match?.[1] ?? 'payload-backup.json.gz';
}

async function downloadBackup(url: string): Promise<void> {
  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) throw new Error(`Backup download failed (${response.status}).`);

  const href = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = href;
  link.download = fileNameFrom(response);
  link.click();
  URL.revokeObjectURL(href);
}

export function BackupsPanel({ apiRoute, source }: PropsType) {
  const [file, setFile] = useState<File | null>(null);
  const [includeUsers, setIncludeUsers] = useState(false);
  const [backupFirst, setBackupFirst] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<Status>({ type: 'idle' });

  const exportUrl = `${apiRoute}/backups/export`;
  const isWorking = status.type === 'working';

  async function onExport() {
    setStatus({ type: 'working', message: 'Preparing backup…' });

    try {
      await downloadBackup(exportUrl);
      setStatus({ type: 'idle' });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : String(error) });
    }
  }

  async function onImport(event: FormEvent) {
    event.preventDefault();
    if (!file || !confirmed) return;

    try {
      if (backupFirst) {
        setStatus({ type: 'working', message: 'Downloading a backup of the current database…' });
        await downloadBackup(exportUrl);
      }

      setStatus({ type: 'working', message: `Importing ${file.name}…` });

      const response = await fetch(`${apiRoute}/backups/import?users=${includeUsers ? 1 : 0}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: file,
      });
      const data = await response.json().catch(() => ({ error: `Import failed (${response.status}).` }));

      if (!response.ok) throw new Error(data.error ?? `Import failed (${response.status}).`);

      setStatus({ type: 'done', result: data });
      setConfirmed(false);
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : String(error) });
    }
  }

  return (
    <div className={`gutter gutter--left gutter--right ${styles.panel}`}>
      <h1>Backups</h1>
      <p className={styles.muted}>
        Database: <strong>{source}</strong>
      </p>

      <section className={styles.card}>
        <h2>Export</h2>
        <p className={styles.muted}>
          Downloads every Payload table (content, media records, users, MCP keys) as a gzipped JSON file. Media files
          are not inside the backup: the import copies them from this site&apos;s storage.
        </p>
        <button type="button" className={BUTTON} onClick={onExport} disabled={isWorking}>
          Download backup
        </button>
      </section>

      <form className={styles.card} onSubmit={onImport}>
        <h2>Import</h2>
        <p className={styles.muted}>
          Replaces all content in this database with the backup and copies missing media files into this site&apos;s
          storage. Both databases must have the same migrations applied.
        </p>

        <input
          type="file"
          accept=".gz,.json,application/gzip,application/json"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          disabled={isWorking}
        />

        <label className={styles.option}>
          <input type="checkbox" checked={backupFirst} onChange={(event) => setBackupFirst(event.target.checked)} />
          Download a backup of this database before importing
        </label>

        <label className={styles.option}>
          <input type="checkbox" checked={includeUsers} onChange={(event) => setIncludeUsers(event.target.checked)} />
          Also replace users, MCP API keys and admin preferences (you will be logged out)
        </label>

        <label className={`${styles.option} ${styles.danger}`}>
          <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />I
          understand that all content on {source} will be replaced
        </label>

        <button type="submit" className={BUTTON} disabled={!file || !confirmed || isWorking}>
          Import backup
        </button>
      </form>

      {status.type === 'working' && <p className={styles.status}>{status.message}</p>}
      {status.type === 'error' && <p className={`${styles.status} ${styles.danger}`}>{status.message}</p>}
      {status.type === 'done' && (
        <div className={styles.card}>
          <h2>Imported</h2>
          <p className={styles.muted}>
            From {status.result.source}, created {new Date(status.result.createdAt).toLocaleString()}.
          </p>
          <p className={styles.muted}>
            Media files: {status.result.files.copied} copied, {status.result.files.skipped} already in place.
          </p>
          <ul className={styles.tables}>
            {Object.entries(status.result.tables).map(([table, count]) => (
              <li key={table}>
                {table}: {count}
              </li>
            ))}
          </ul>
          {status.result.includeUsers && (
            <Link className={SECONDARY_BUTTON} href="/admin/login">
              Log in again
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
