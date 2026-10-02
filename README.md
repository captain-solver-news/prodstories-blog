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
| `pnpm payload:migrate`        | Apply pending Payload migrations                     |
| `pnpm payload:migrate:create` | Create a new migration from config changes           |
| `pnpm payload:types`          | Regenerate `lib/payload/generated-types.ts`          |
| `pnpm payload:db-schema`      | Regenerate `lib/payload/generated-schema.ts`         |
| `pnpm payload:importmap`      | Regenerate the admin import map                      |

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
