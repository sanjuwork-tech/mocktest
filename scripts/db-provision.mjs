import { ownerConnection } from "./db-env.mjs";
// Run as database owner. Runtime receives only the grants needed by Phase 1.
const sql = ownerConnection();
try {
  const url = new URL(process.env.DATABASE_URL ?? "");
  const role = decodeURIComponent(url.username),
    password = decodeURIComponent(url.password);
  if (!/^[a-z][a-z0-9_]{2,62}$/.test(role) || !password)
    throw new Error(
      "Use a dedicated runtime role and password in DATABASE_URL.",
    );
  const [owner] = await sql`select current_user as name`;
  if (role === owner.name)
    throw new Error("Runtime and migration owner must be different roles.");
  const [exists] =
    await sql`select rolname from pg_roles where rolname=${role}`;
  if (!exists)
    await sql.unsafe(
      `CREATE ROLE "${role}" LOGIN PASSWORD '${password.replaceAll("'", "''")}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`,
    );
  await sql.unsafe(
    `GRANT CONNECT ON DATABASE "${decodeURIComponent(url.pathname.slice(1)).replaceAll('"', '""')}" TO "${role}"`,
  );
  await sql.unsafe(`GRANT USAGE ON SCHEMA public TO "${role}"`);
  // The app never deletes business records; it only appends audit rows and expires rate limits.
  const readWriteTables = [
    "users", "sessions", "products", "orders", "payment_events", "entitlements",
    "exams", "exam_cycles", "assets", "question_imports", "question_import_items",
    "question_bank", "question_revisions", "question_options", "private_answer_keys",
    "tests", "test_versions", "test_sections", "test_assignments",
    "attempts", "attempt_answers", "attempt_results", "waitlist_entries",
  ];
  await sql.unsafe(
    `GRANT SELECT, INSERT, UPDATE ON ${readWriteTables.join(", ")} TO "${role}"`,
  );
  await sql.unsafe(`GRANT SELECT, INSERT ON audit_log TO "${role}"`);
  await sql.unsafe(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON auth_rate_limits TO "${role}"`,
  );
  console.log("Applied runtime grants.");
} finally {
  await sql.end();
}
