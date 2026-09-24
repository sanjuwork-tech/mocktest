# MockStride

An exam-discovery platform for students exploring opportunities after Class 12. The first release brings CUET UG, IISER IAT, NEST and COMEDK UGET together on one page, with opportunities, eligibility, exam formats, published dates, official notices and candidate links.

The Preparation page presents all four planned mock series with their inclusions, counts and clearly labelled proposed prices. Checkout, learner accounts and test-taking are not implemented. Backend security and payment launch blockers remain documented in `docs/FRONTEND-PROGRESS.md`.

## Run locally

Use Node.js 22.18+ (Node 24 was used for validation).

1. Run `npm ci`.
2. Run `npm run dev`. Public exam guides do not require a database.
3. If local Turbopack subprocesses are restricted, use `npm run dev -- --webpack`.
4. To test a production build, run `npm run build -- --webpack`, then `npm start`.

`next/font/google` downloads the configured fonts during a build; network access is required. The default `npm run build` still uses Turbopack.

Set `NEXT_PUBLIC_SITE_URL` to the deployed public origin for canonical and sharing URLs. For admin/database use, configure real `DATABASE_URL`, `ADMIN_PASSWORD` and `AUTH_SECRET` values in your environment; do not use the example placeholders. Database schema changes and security hardening need a separate reviewed release before production use.

Drizzle CLI commands read `DATABASE_URL` from the process environment; export it explicitly when running migrations. `npm run db:migrate` applies checked-in migrations. Use `db:generate` only after intentional schema changes. No production database was accessed during frontend development.

## Validate

- `npm run lint`
- `npm test`
- `npx tsc --noEmit --incremental false`
- `npm run build -- --webpack`

Tests cover directory search, complete guide fields, official-link hosts, historical application states, stale review detection and request error formatting. They do not replace live database or browser testing.

## Routes and content

- `/`: discovery homepage.
- `/exams`: every exam guide, notifications and application checklist on one page.
- `/test-series`: mock-series catalog with proposed pricing and enquiry links, without a purchase flow.
- `/about`: mission, vision and information-review policy.
- `/exams/[slug]`: permanent redirects to the corresponding `/exams#slug` section.
- `/results`: redirects to official exam notices at `/exams#notifications`.
- `/admin`: authenticated database inventory with search and editing.

Primary guide content is server-rendered and visible without JavaScript. Search progressively enhances the shortcut cards; all full exam sections remain available below, including when a filter has no matches.

Exam summaries are manually maintained in `src/data/exams.ts`, with explicit cycle, review date, source and verification status. They are not an automatically refreshed notification service. See `docs/FRONTEND-PROGRESS.md` for update rules, remaining audit issues and verification limitations; see `docs/BRAND.md` for brand conventions.
