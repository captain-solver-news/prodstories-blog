import { gunzipSync, gzipSync } from 'node:zlib';
import { sql } from 'drizzle-orm';
import type { Payload } from 'payload';
import { copyMediaFiles, currentFileSource, type FileSource, type FilesSummary } from './media-files';

export const BACKUP_FORMAT = 'prodstories-payload-backup';
export const BACKUP_VERSION = 1;

const SKIPPED_TABLES = new Set([
  'payload_migrations',
  'payload_locked_documents',
  'payload_locked_documents_rels',
  'payload_kv',
  'users_sessions',
]);

const RESET_TABLES = ['payload_locked_documents', 'payload_locked_documents_rels'];

export const AUTH_TABLES = new Set([
  'users',
  'payload_mcp_api_keys',
  'payload_preferences',
  'payload_preferences_rels',
]);

type Row = Record<string, unknown>;

export type Backup = {
  format: typeof BACKUP_FORMAT;
  version: number;
  createdAt: string;
  source: string;
  migrations: string[];
  files: FileSource;
  tables: Record<string, Row[]>;
};

export type ImportOptions = {
  includeUsers: boolean;
};

export type ImportSummary = {
  tables: Record<string, number>;
  files: FilesSummary;
  includeUsers: boolean;
};

type Executor = Pick<Payload['db']['drizzle'], 'execute'>;

async function rows<T>(db: Executor, query: ReturnType<typeof sql>): Promise<T[]> {
  const result = await db.execute(query);

  return result.rows as T[];
}

async function listTables(db: Executor): Promise<string[]> {
  const result = await rows<{ name: string }>(
    db,
    sql`SELECT tablename AS name FROM pg_tables WHERE schemaname = current_schema() ORDER BY tablename`
  );

  return result.map(({ name }) => name);
}

async function listMigrations(db: Executor): Promise<string[]> {
  const result = await rows<{ name: string }>(
    db,
    sql`SELECT name FROM payload_migrations WHERE batch <> -1 ORDER BY name`
  );

  return result.map(({ name }) => name);
}

async function sortByDependencies(db: Executor, tables: string[]): Promise<string[]> {
  const edges = await rows<{ child: string; parent: string }>(
    db,
    sql`
      SELECT child.relname AS child, parent.relname AS parent
      FROM pg_constraint con
      JOIN pg_class child ON child.oid = con.conrelid
      JOIN pg_class parent ON parent.oid = con.confrelid
      JOIN pg_namespace ns ON ns.oid = child.relnamespace
      WHERE con.contype = 'f' AND ns.nspname = current_schema()
    `
  );

  const included = new Set(tables);
  const parents = new Map(tables.map((table) => [table, new Set<string>()]));

  for (const { child, parent } of edges) {
    if (child !== parent && included.has(child) && included.has(parent)) parents.get(child)?.add(parent);
  }

  const sorted: string[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (table: string) => {
    if (visited.has(table)) return;
    if (visiting.has(table)) throw new Error(`Circular foreign keys around "${table}".`);

    visiting.add(table);
    parents.get(table)?.forEach(visit);
    visiting.delete(table);
    visited.add(table);
    sorted.push(table);
  };

  tables.forEach(visit);

  return sorted;
}

async function resetSequences(db: Executor, tables: string[]): Promise<void> {
  const sequences = await rows<{ table: string; column: string; sequence: string }>(
    db,
    sql`
      SELECT table_name AS table, column_name AS column, seq AS sequence
      FROM (
        SELECT table_name, column_name, pg_get_serial_sequence(quote_ident(table_name), column_name) AS seq
        FROM information_schema.columns
        WHERE table_schema = current_schema()
      ) columns
      WHERE seq IS NOT NULL
    `
  );

  for (const { table, column, sequence } of sequences) {
    if (!tables.includes(table)) continue;

    await db.execute(sql`
      SELECT setval(${sequence}, COALESCE(MAX(${sql.identifier(column)}), 1), MAX(${sql.identifier(column)}) IS NOT NULL)
      FROM ${sql.identifier(table)}
    `);
  }
}

export async function createBackup(payload: Payload, source: string): Promise<Backup> {
  const db = payload.db.drizzle;
  const tables = (await listTables(db)).filter((table) => !SKIPPED_TABLES.has(table));
  const data: Record<string, Row[]> = {};

  for (const table of tables) {
    const [{ data: tableRows }] = await rows<{ data: Row[] }>(
      db,
      sql`SELECT COALESCE(json_agg(t), '[]'::json) AS data FROM ${sql.identifier(table)} t`
    );
    data[table] = tableRows;
  }

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    source,
    migrations: await listMigrations(db),
    files: currentFileSource(),
    tables: data,
  };
}

function assertCompatible(backup: Backup, migrations: string[], tables: string[]): void {
  if (backup?.format !== BACKUP_FORMAT || !backup.tables || !backup.files || !Array.isArray(backup.migrations)) {
    throw new Error('This file is not a Payload backup.');
  }

  if (backup.version !== BACKUP_VERSION) {
    throw new Error(`Unsupported backup version ${backup.version}, expected ${BACKUP_VERSION}.`);
  }

  const missing = backup.migrations.filter((name) => !migrations.includes(name));
  const extra = migrations.filter((name) => !backup.migrations.includes(name));

  if (missing.length || extra.length) {
    throw new Error(
      [
        'The backup was made on a different database schema.',
        missing.length ? `Not applied here: ${missing.join(', ')}.` : '',
        extra.length ? `Not applied in the backup: ${extra.join(', ')}.` : '',
        'Bring both databases to the same migrations first.',
      ]
        .filter(Boolean)
        .join(' ')
    );
  }

  const unknown = Object.keys(backup.tables).filter((table) => !tables.includes(table));

  if (unknown.length) throw new Error(`Unknown tables in the backup: ${unknown.join(', ')}.`);
}

function databaseErrorMessage(error: unknown): string {
  const cause = error instanceof Error && error.cause instanceof Error ? error.cause : error;
  if (!(cause instanceof Error)) return String(cause);

  const detail = 'detail' in cause && typeof cause.detail === 'string' ? ` (${cause.detail})` : '';

  return `${cause.message}${detail}`;
}

export async function restoreBackup(payload: Payload, backup: Backup, options: ImportOptions): Promise<ImportSummary> {
  const db = payload.db.drizzle;
  const existing = await listTables(db);

  assertCompatible(backup, await listMigrations(db), existing);

  const files = await copyMediaFiles(payload, backup.files, backup.tables.media ?? []);

  const tables = await sortByDependencies(
    db,
    Object.keys(backup.tables).filter((table) => options.includeUsers || !AUTH_TABLES.has(table))
  );
  const truncated = [...tables, ...RESET_TABLES.filter((table) => existing.includes(table))];
  const summary: Record<string, number> = {};

  await db.transaction(async (tx) => {
    await tx.execute(
      sql`TRUNCATE ${sql.join(
        truncated.map((table) => sql.identifier(table)),
        sql`, `
      )} CASCADE`
    );

    for (const table of tables) {
      const tableRows = backup.tables[table];
      summary[table] = tableRows.length;

      if (!tableRows.length) continue;

      try {
        await tx.execute(sql`
          INSERT INTO ${sql.identifier(table)}
          SELECT * FROM json_populate_recordset(NULL::${sql.identifier(table)}, ${JSON.stringify(tableRows)}::json)
        `);
      } catch (error) {
        throw new Error(`Could not import "${table}": ${databaseErrorMessage(error)}. Nothing was changed.`);
      }
    }

    await resetSequences(tx, tables);
  });

  return { tables: summary, files, includeUsers: options.includeUsers };
}

export function encodeBackup(backup: Backup): Buffer {
  return gzipSync(JSON.stringify(backup));
}

export function decodeBackup(buffer: Buffer): Backup {
  const isGzip = buffer[0] === 0x1f && buffer[1] === 0x8b;

  try {
    return JSON.parse((isGzip ? gunzipSync(buffer) : buffer).toString('utf8'));
  } catch {
    throw new Error('Could not read the backup file. Expected .json or .json.gz.');
  }
}

export function backupFileName(source: string, date = new Date()): string {
  const stamp = date.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const env = source
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '');

  return `payload-backup_${env}_${stamp}.json.gz`;
}
