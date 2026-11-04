# OurMocks

Full-length mock tests and exam guidance for Class 12 students taking CUET UG, IISER IAT, NISER NEST and COMEDK UGET. Test 1 of every exam is free; every test ends with time-per-question analysis.

Next.js 16 (App Router) · React 19 · TypeScript · Postgres with Drizzle ORM · deployed on Vercel from `main`.

## Where things live

| Folder | What it holds |
|---|---|
| `src/app` | Pages and API routes. Public site, `student/` (tests, results, analysis), `admin/`, `api/` |
| `src/components` | UI components; `student/` holds the exam player, results and analysis views |
| `src/data` | Site content: exam guides, colleges, blog, syllabus, past papers, product catalog |
| `src/lib` | Pure logic shared by server and browser: blueprints (official patterns), analysis, eligibility, score calculator |
| `src/server` | Server-only code: auth, sessions, scoring, test papers, payments |
| `src/db` | Database schema and connection |
| `drizzle/` | Database migrations (apply with `npm run db:migrate`) |
| `content/question-bank` | Source question bank used to generate CUET papers (not loaded by the app) |
| `data/test-papers` | Generated paper JSON ready to upload. Local only, not in git |
| `scripts/` | Command-line tools: database, paper generation and import |
| `tests/` | Unit tests (`*.test.mjs`) and database/SEO integration checks (`*.integration.mjs`) |
| `public/` | Logo, share image and college photos |
| `docs/` | PRD, TRD, test-paper and question-format guides (local, not in git); `docs/archive/` holds superseded documents |

`src/lib/blueprints/definitions.ts` is the single source for each exam's pattern and marking. When a new bulletin changes a pattern, change it there; the player, scoring, paper checks and free-test page follow.

## Run locally

Node.js 22.18 or newer.

```
npm ci
npm run db:local        # start the local Postgres on port 5433
npm run dev             # http://localhost:3000
```

First time on a new database: `npm run db:migrate`, `npm run db:seed` (creates the admin account from `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD`), then `npm run db:import-papers`. Copy `.env.example` to `.env.local` and fill it in first.

## Test papers

Upload paper JSON at `/admin/test-papers` (or `npm run db:import-papers`). Each paper is checked against its exam's official pattern before import. Format and workflow: `docs/TEST-PAPERS.md`.

## Checks

```
npm run lint
npm test
npm run build -- --webpack
```

`GET /api/health` reports whether the database is connected and migrated.

## Deploying

Vercel needs `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CANONICAL_URL`. Run migrations against the production database from your machine with `DATABASE_MIGRATION_URL`; never add that variable to Vercel. Guest sign-in is on unless `GUEST_LOGIN_ENABLED=false`.
