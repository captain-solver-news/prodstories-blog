# ProdStories

A Next.js blog with PostgreSQL, Payload CMS, and TypeScript.

Payload owns the content model: it generates the database schema and is the only source of
DDL. The public site reads data through the functions in `lib/actions`, which run SQL via
Payload's Drizzle instance (`payload.db.drizzle`) against the tables in
`lib/payload/generated-schema.ts`. This covers queries Payload's Local API cannot express, such
as recursive category paths.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20.9 or higher)
- [pnpm](https://pnpm.io/) (v10 or higher)
- [Docker](https://www.docker.com/) and Docker Compose

## Setup from Scratch

### 1. Clone the repository

```bash
git clone git@github.com:captain-solver-news/prodstories-blog.git
cd prodstories-blog
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start the database

Start PostgreSQL using Docker Compose:

```bash
docker compose up -d
```

This runs PostgreSQL 16 on port 5432 with:

- **User:** admin
- **Password:** admin
- **Database:** db

It also starts [Adminer](https://www.adminer.org/) at [http://localhost:5431](http://localhost:5431)
for browsing the database (server: `postgres`).

### 4. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable                | Description                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `APP_ENV`               | `production` or `development` (default). Outside `production` the site is noindexed, robots.txt disallows all, no canonicals |
| `PUBLIC_SITE_URL`       | Public base URL, used for canonical URLs, sitemap, robots and llms.txt                                                       |
| `DATABASE_URL`          | PostgreSQL connection string                                                                                                 |
| `PAYLOAD_SECRET`        | Secret for Payload auth — replace with a long random string                                                                  |
| `BLOB_READ_WRITE_TOKEN` | Optional Vercel Blob token for uploads                                                                                       |
| `HTTP_LOGIN`            | Optional HTTP Basic Auth login. Basic Auth is enabled only when `HTTP_LOGIN` or `HTTP_PASSWORD` is set                       |
| `HTTP_PASSWORD`         | Optional HTTP Basic Auth password                                                                                            |

> **Note:** If you changed the database credentials in `docker-compose.yml`, update `DATABASE_URL` in `.env` accordingly.

To store Payload uploads in Vercel Blob, connect a public Blob store to the Vercel project. Vercel
adds `BLOB_READ_WRITE_TOKEN` automatically. For local development, copy that token into `.env`.
Without the token, Payload keeps uploads on the local filesystem.

### 5. Run database migrations

Apply Payload's migrations to the database:

```bash
pnpm payload:migrate
```

### 6. Seed sample content (optional)

```bash
pnpm db:seed
```

> **Warning:** the seed truncates `posts`, `categories`, `authors`, `static_contents`, `configs`
> and `media` before inserting. Only run it against an empty or throwaway database.

### 7. Create an admin user

Start the app with `pnpm dev` and open [http://localhost:3000/admin](http://localhost:3000/admin) —
Payload prompts for the first user on a fresh install.

## Available Scripts

| Command                       | Description                                          |
| ----------------------------- | ---------------------------------------------------- |
| `pnpm dev`                    | Start the dev server                                 |
| `pnpm build`                  | Run Payload migrations, then build                   |
| `pnpm start`                  | Serve the production build                           |
| `pnpm lint`                   | Lint with ESLint                                     |
| `pnpm format`                 | Format code with Prettier                            |
| `pnpm db:seed`                | Seed sample content (truncates content tables first) |
| `pnpm db:export [file]`       | Download a backup of the database (see Backups)      |
| `pnpm db:import <file>`       | Replace the database content with a backup           |
| `pnpm payload:migrate`        | Apply pending Payload migrations                     |
| `pnpm payload:migrate:create` | Create a new migration from config changes           |
| `pnpm payload:types`          | Regenerate `lib/payload/generated-types.ts`          |
| `pnpm payload:db-schema`      | Regenerate `lib/payload/generated-schema.ts`         |
| `pnpm payload:importmap`      | Regenerate the admin import map                      |

## Backups

Open **Backups** in the admin sidebar (`/admin/backups`):

- **Download backup** saves every Payload table as `payload-backup_<site>_<date>.json.gz`.
- **Import backup** replaces all content with a backup in one transaction. If any row fails, nothing
  changes. By default it downloads a backup of the current database first. Users, MCP API keys and
  admin preferences are kept unless you tick the option to replace them too (then you are logged out).

The same works from the terminal against any database in `DATABASE_URL`:

```bash
DATABASE_URL=<prod-url> pnpm db:export prod.json.gz
pnpm db:import prod.json.gz              # into the local DATABASE_URL, keeps local users
pnpm db:import prod.json.gz --with-users # also replaces users and MCP API keys
```

Import only works between databases with the same applied migrations. Run `pnpm payload:migrate`
on the target, or check out the matching branch, before importing.

Backups hold database rows only. A backup remembers where its media files live, and the import copies
every missing file into the storage of the target environment before it touches the database:

| Source → target          | Where files are copied from and to                                         |
| ------------------------ | -------------------------------------------------------------------------- |
| Blob → other Blob store  | Public URL of the source store → target store (`BLOB_READ_WRITE_TOKEN`)    |
| Blob → local (no token)  | Public URL of the source store → local `media/` folder                     |
| Local → Blob             | Local `media/` folder → target store. Run `pnpm db:import` on that machine |
| Same Blob store or local | Nothing to copy                                                            |

Files that already exist in the target are skipped, so repeated imports only copy what is new. If a
file cannot be copied, the import stops and the database stays unchanged. To push a local backup to
dev or prod, run the CLI with the target credentials:

```bash
DATABASE_URL=<dev-url> BLOB_READ_WRITE_TOKEN=<dev-token> pnpm db:import local.json.gz
```

Files that are no longer referenced stay in the target storage. A local or dev environment that uses
the production `BLOB_READ_WRITE_TOKEN` deletes the production file when you delete a media document
there. Through the admin, Vercel limits the uploaded backup to 4.5 MB and the import must finish
within the function time limit. Use `pnpm db:import` for bigger databases or many new files.

## Project Structure

```
.
├── app/
│   ├── (frontend)/             # Public site routes, sitemap, llms.txt, llms-full.txt
│   ├── (payload)/              # Payload admin + REST/GraphQL routes
│   └── robots.ts               # robots.txt
├── components/                 # React components (blocks, lists, wrappers, primitives, seo)
├── lib/
│   ├── actions/                # Data fetching for the public site
│   ├── payload/
│   │   ├── config.ts           # Payload config (aliased as @payload-config)
│   │   ├── collections/        # Collection definitions — the content model
│   │   ├── blocks/             # Rich text blocks
│   │   ├── hooks/              # Collection hooks
│   │   ├── backup/             # Backup export/import with media files: admin view, endpoints, CLI
│   │   ├── migrations/         # The only source of DDL for this database
│   │   ├── taxonomy.ts         # Status/Type values shared with the read layer
│   │   ├── seed.ts             # Sample content script
│   │   ├── generated-schema.ts # `payload generate:db-schema` — do not edit
│   │   └── generated-types.ts  # `payload generate:types` — do not edit
│   ├── seo/                    # Metadata, JSON-LD and llms.txt builders
│   └── utils/                  # Shared helpers
├── public/                     # Static assets
├── styles/                     # Global SCSS
├── patches/                    # pnpm patches for dependencies
├── config.ts                   # Site constants (name, prefixes, pagination, links)
├── docker-compose.yml          # PostgreSQL + Adminer containers
├── tsconfig.json               # TypeScript configuration
├── .env.example                # Environment variables template
└── .env                        # Copy from .env.example (see step 4)
```

## Stopping the Database

```bash
docker compose down
```

To remove the database volume as well:

```bash
docker compose down -v
```
