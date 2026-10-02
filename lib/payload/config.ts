import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { mcpPlugin } from '@payloadcms/plugin-mcp';

import { Users } from '@/lib/payload/collections/users';
import { Authors } from '@/lib/payload/collections/authors';
import { Categories } from '@/lib/payload/collections/categories';
import { Posts } from '@/lib/payload/collections/posts';
import { StaticContents } from '@/lib/payload/collections/static-contents';
import { Configs } from '@/lib/payload/collections/configs';
import { Media } from '@/lib/payload/collections/media';
import { getSiteUrl } from '@/lib/seo/url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(dirname, '../..');

export default buildConfig({
  serverURL: getSiteUrl(),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: projectRoot,
    },
  },
  collections: [Categories, Posts, StaticContents, Configs, Authors, Media, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'generated-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    idType: 'uuid',
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
    generateSchemaOutputFile: path.resolve(dirname, 'generated-schema.ts'),
  }),
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: {
        media: {
          prefix: 'media',
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
      addRandomSuffix: true,
      alwaysInsertFields: true,
    }),
    mcpPlugin({
      collections: {
        posts: {
          enabled: true,
          description: 'Blog posts. The body field is Lexical rich text JSON.',
        },
        categories: {
          enabled: true,
          description: 'Post categories.',
        },
        authors: {
          enabled: true,
          description: 'Post authors.',
        },
        'static-contents': {
          enabled: true,
          description: 'Rich text blocks addressed by a stable string id (about, contact, ...).',
        },
        configs: {
          enabled: true,
          description: 'Key/value settings the site reads by id.',
        },
        media: {
          enabled: { find: true, update: true },
          description: 'Uploaded images stored in Vercel Blob.',
        },
      },
    }),
  ],
});
