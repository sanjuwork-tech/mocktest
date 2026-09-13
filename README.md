# MockStride

Production-oriented exam test-series storefront for CUET UG, IISER IAT, NISER NEST, and COMEDK UGET.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4
- Motion for spring-based 3D interactions
- Drizzle ORM + PostgreSQL
- Static metadata, structured data, robots, and sitemap routes

## Local setup

1. Copy `.env.example` to `.env.local` and replace each placeholder.
2. Run `npm install`.
3. Run `npm run db:generate` and `npm run db:migrate` after creating the database.
4. Run `npm run dev`.

## Vercel

Import the repository in Vercel and add `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `ADMIN_PASSWORD`, and `AUTH_SECRET` in project settings. The repository includes `vercel.json` and uses the standard Next.js build.

## Public routes

- `/`
- `/test-series`
- `/results`
- `/about`
- `/exams/cuet-ug`
- `/exams/iiser-iat`
- `/exams/niser-nest`
- `/exams/comedk`

The public pages are server-rendered/static HTML, so their primary content is available to search-engine crawlers without requiring client-side JavaScript.
