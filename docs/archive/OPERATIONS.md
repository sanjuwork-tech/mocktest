# TestDisha Operations & Staging Runbook

This runbook documents the operational procedures, database disaster recovery drills, deployment checklists, and end-to-end staging verification processes for **TestDisha** (Phase 7: Launch Verification and Operations).

---

## 1. Architecture & Infrastructure Topology

```
                       [ Cloudflare / Reverse Proxy ]
                                     │
                    (HTTPS, WAF, Security Headers)
                                     │
                                     ▼
                      [ Next.js Application Tier ]
            (SSR, Server Actions, Server-Authoritative Logic)
             ├── Student Auth (OAuth2 / Secure Session Cookies)
             ├── Autosave & Attempt Engine (400ms debounce, 60s grace)
             ├── Server-Authoritative Scoring Engine
             └── Razorpay Webhook Ingestion (HMAC-SHA256 verified)
                                     │
                       (Connection Pool: max 20-50,
                        idle 20s, statement_timeout 10s)
                                     ▼
                       [ PostgreSQL Database Tier ]
             ├── drizzle.__drizzle_migrations (Schema Ledger)
             ├── users, sessions, entitlements, orders
             ├── tests, test_sections, test_questions, questions
             └── attempts, attempt_answers, attempt_results
```

### Connection Pool Configuration (`src/db/client.ts`)
- **Web Tier Pool Limit**: Default `20` concurrent connections (configurable via `DB_POOL_MAX`, up to `50` for peak exam loads).
- **Development/Test Pool**: Default `3` connections to prevent local exhaustion.
- **Connection Timeout**: `10 seconds` (`connect_timeout: 10`).
- **Idle Timeout**: `20 seconds` (`idle_timeout: 20`) to reclaim zombie connections quickly.
- **Max Lifetime**: `30 minutes` (`max_lifetime: 60 * 30`) to protect against long-lived socket leaks.
- **Statement Timeout**: `10,000 ms` (`statement_timeout: 10000`) on transactional queries to kill accidental runaway queries.

---

## 2. Database Backup Procedures & Drills

TestDisha utilizes a logical snapshotting tool (`scripts/db-backup.mjs`) designed for zero-data-loss consistency, atomic point-in-time state capture, and migration ledger tracking.

### 2.1 Backup Mechanism
- **Transaction Isolation**: Executes within `BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY` to ensure cross-table relational consistency while allowing concurrent reads/writes from live students.
- **Ledger Binding**: Captures the exact migration history (`hash` and `created_at` from `drizzle.__drizzle_migrations`) along with the table data.
- **Table Data Serialization**: Aggregates records using PostgreSQL native `jsonb_agg` across all public tables.
- **Filesystem Security**: Automatically creates the target directory with strict permissions (`0o700`) and writes the snapshot with file mode `0o600` and exclusive write flag (`wx`) to prevent inadvertent overwrite.

### 2.2 Executing a Backup Drill
Run the backup script pointing to an isolated, non-public directory:

```bash
# Automated logical backup command
npm run db:backup -- .local/backups/snapshot-$(date +%Y%m%d%H%M%S).json
```

**Output format verification**:
```json
{
  "format": "testdisha-logical-data-v1",
  "createdAt": "2026-09-24T16:00:00.000Z",
  "migrations": [
    { "hash": "...", "created_at": 1710000000000 }
  ],
  "data": {
    "users": [ ... ],
    "entitlements": [ ... ],
    "tests": [ ... ],
    "attempts": [ ... ]
  }
}
```

### 2.3 Automated Backup Schedule
In production, schedule daily and pre-deployment backups using a cron job or container task scheduler:
```cron
# Daily backup at 02:00 UTC with automated offsite upload
0 2 * * * cd /opt/testdisha && npm run db:backup -- /var/backups/testdisha/backup-$(date +\%F).json && aws s3 cp /var/backups/testdisha/backup-$(date +\%F).json s3://testdisha-backups-secure/daily/ --sse aws:kms
```
- **Retention**: Keep 30 daily backups, 12 weekly backups, and 12 monthly snapshots with encryption at rest.

---

## 3. Database Restore & Disaster Recovery Drill

The restore tool (`scripts/db-restore.mjs`) guarantees referential integrity, schema alignment, and fail-safe execution.

### 3.1 Safeguards & Guarantees
1. **Format Validation**: Rejects any file not matching signature `"testdisha-logical-data-v1"`.
2. **Schema Ledger Match**: Compares the backup's migration history with the target database's `drizzle.__drizzle_migrations`. If any migration hash differs or is missing, restore aborts immediately.
3. **Empty Target Enforcement**: Acquires `LOCK TABLE IN ACCESS EXCLUSIVE MODE` on all public tables and verifies `count(*) === 0`. If any table contains existing rows, the transaction aborts with zero changes.
4. **Topological Dependency Resolution**: Queries PostgreSQL catalog `pg_constraint` for foreign key constraints (`c.contype = 'f'`) and dynamically builds an acyclic graph to insert parent tables before child tables using `jsonb_populate_recordset`.

### 3.2 Executing a Restore Drill (Step-by-Step)
To test and verify a restore drill into a staging/disaster recovery database:

1. **Provision a clean target database**:
   ```bash
   createdb testdisha_dr
   ```
2. **Run migrations to match current schema version**:
   ```bash
   DATABASE_MIGRATION_URL="postgres://postgres:postgres@localhost:5432/testdisha_dr" npm run db:migrate
   ```
3. **Execute the verified restore**:
   ```bash
   DATABASE_MIGRATION_URL="postgres://postgres:postgres@localhost:5432/testdisha_dr" node scripts/db-restore.mjs .local/backups/snapshot-20260924.json --into-empty
   ```
4. **Verify integrity**:
   ```sql
   -- Run in psql against testdisha_dr:
   SELECT 'users' as tbl, count(*) FROM users
   UNION ALL
   SELECT 'tests', count(*) FROM tests
   UNION ALL
   SELECT 'attempts', count(*) FROM attempts
   UNION ALL
   SELECT 'attempt_results', count(*) FROM attempt_results;
   ```

---

## 4. Rollback and Deployment Procedures

### 4.1 Deployment Strategy
- **Blue-Green / Rolling Deployments**: Deploy new application builds without terminating active exam connections.
- **Database Schema Evolution**: Follow the **Expand-and-Contract** pattern:
  - Phase 1 (*Expand*): Add new columns with nullable defaults. Deploy new code that writes to both old and new columns.
  - Phase 2 (*Migrate*): Backfill historical data.
  - Phase 3 (*Contract*): Deprecate and drop obsolete columns only after verified production stability.

### 4.2 Application Rollback
If a newly deployed build exhibits regressions:
1. Revert container image or Git commit hash to the previous verified release tag (`vX.Y.Z`).
2. Because the database was migrated using the expand-and-contract policy, the previous code build runs seamlessly against the current database schema without schema rollback.

---

## 5. Security and Environment Pre-Flight Checklist

Before opening the platform for live traffic or production access, verify that all mandatory environment variables and security protections are active:

| Environment Variable | Production Requirement | Audit Check |
|---|---|---|
| `DATABASE_URL` | Pooled connection string with TLS (`sslmode=require`) | Verified non-null |
| `DATABASE_MIGRATION_URL` | Direct connection string for DDL migrations | Restricted to CI/admin |
| `SESSION_SECRET` | Cryptographically random 64+ char secret | Must not match dev defaults |
| `ADMIN_PASSWORD_HASH` | Scrypt hash (`scrypt:salt:hash`) | Minimum 12-char passphrase |
| `RAZORPAY_KEY_ID` | Live merchant key (`rzp_live_...`) | Sandbox keys forbidden in prod |
| `RAZORPAY_KEY_SECRET` | Live merchant secret | Kept in secret manager |
| `RAZORPAY_WEBHOOK_SECRET` | Secret configured in Razorpay Dashboard | Must match webhook signature |
| `GOOGLE_CLIENT_ID` | Production Google Cloud OAuth2 Client ID | Authorized origins verified |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth2 Client Secret | Validated via token exchange |
| `NEXT_PUBLIC_SITE_URL` | Canonical public HTTPS URL (`https://...`) | HTTPS required, no trailing slash |

### Security Headers Verification
Next.js configuration (`next.config.ts`) injects mandatory security headers globally:
- `Content-Security-Policy`: Disallows unauthorized frame embeddings (`frame-ancestors 'none'`) and object embedding (`object-src 'none'`).
- `X-Frame-Options: DENY`: Prevents UI clickjacking attacks.
- `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing.
- `Referrer-Policy: strict-origin-when-cross-origin`: Restricts referrer leaking.
- `Permissions-Policy`: Restricts camera, microphone, and geolocation access (`camera=(), microphone=(), geolocation=()`).
- `Cross-Origin-Opener-Policy: same-origin`: Isolates the browsing context.
- `Strict-Transport-Security`: HSTS preload enabled for 2 years (`max-age=63072000; includeSubDomains; preload`).
- `X-Robots-Tag: noindex, nofollow`: Prohibits search indexing of `/admin/*`, `/student/*`, and `/api/*`.

---

## 6. End-to-End Student Journey Sign-Off

The complete student journey covers all 7 stages of candidate interaction:

```
[ 1. Student Auth ] ────────► [ 2. Entitlement Gate ] ───────► [ 3. Test Start ]
   • Email normalization         • Check free tier / diagnostic    • Snapshot server deadline
   • Scrypt / OAuth Session      • Paid series entitlement gate    • Strip correct & explanation
                                                                   • Order randomization
                                                                           │
                                                                           ▼
[ 6. Result Analytics ] ◄──── [ 5. Submit / Deadline ] ◄────── [ 4. Test Execution ]
   • Server score calculation    • 60s network grace window        • Monotonic sequence tracking
   • Subject & topic breakdown   • Idempotent submission           • 400ms debounced autosave
   • Formula solution access     • Prevent double-scoring          • Mark for review toggling
   • Next-practice priority                                        • Offline queue buffering
           │
           ▼
[ 7. Student Reflection ]
   • Mistake categorization
   • Self-diagnosis persistence
```

### Staging Sign-Off Criteria:
- [x] All automated test suites pass without failure.
- [x] Connection pooling boundaries and timeout enforcement pass concurrent load tests.
- [x] Touch targets, keyboard navigation, and equation overflow pass WCAG 2.1 AA a11y audit.
- [x] Security headers and search engine exclusions pass header inspection.
- [x] End-to-end journey tests demonstrate complete candidate lifecycle integrity.
