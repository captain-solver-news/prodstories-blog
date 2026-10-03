import 'dotenv/config';
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { getPayload } from 'payload';
import config from '@payload-config';
import { backupFileName, createBackup, decodeBackup, encodeBackup, restoreBackup } from './backup';

const USAGE = [
  'Usage:',
  '  pnpm db:export [file]',
  '  pnpm db:import <file> [--with-users] [--yes]',
  '',
  'Both commands use DATABASE_URL, e.g. DATABASE_URL=postgres://... pnpm db:export',
].join('\n');

function databaseLabel(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return 'unknown database';

  const { host, pathname } = new URL(url);

  return `${host}${pathname}`;
}

async function confirm(question: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} [y/N] `);
  rl.close();

  return answer.trim().toLowerCase() === 'y';
}

async function exportCommand(file?: string) {
  const payload = await getPayload({ config });
  const source = databaseLabel();
  const target = file ?? backupFileName(source);
  const backup = await createBackup(payload, source);

  await writeFile(target, encodeBackup(backup));

  const total = Object.values(backup.tables).reduce((sum, rows) => sum + rows.length, 0);
  console.log(`Exported ${total} rows from ${source} to ${target}`);
}

async function importCommand(file: string | undefined, flags: string[]) {
  if (!file) throw new Error(USAGE);

  const backup = decodeBackup(await readFile(file));
  const includeUsers = flags.includes('--with-users');

  console.log(`Backup: ${file} (${backup.source}, ${backup.createdAt})`);
  console.log(`Target: ${databaseLabel()}${includeUsers ? ', users included' : ''}`);

  if (!flags.includes('--yes') && !(await confirm('Replace all content in the target database?'))) {
    console.log('Cancelled.');
    return;
  }

  const payload = await getPayload({ config });
  const summary = await restoreBackup(payload, backup, { includeUsers });

  console.table(summary.tables);
  console.log(`Media files: ${summary.files.copied} copied, ${summary.files.skipped} already in place.`);
  console.log(includeUsers ? 'Users were replaced.' : 'Users were kept.');
}

async function main() {
  const [command, file, ...flags] = process.argv.slice(2);

  if (command === 'export') return exportCommand(file);
  if (command === 'import') return importCommand(file, flags);

  throw new Error(USAGE);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
