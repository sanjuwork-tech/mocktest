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
  await sql.unsafe(
    `GRANT SELECT, INSERT, UPDATE ON users, sessions, products TO "${role}"`,
  );
  await sql.unsafe(`GRANT SELECT, INSERT ON audit_log TO "${role}"`);
  await sql.unsafe(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON auth_rate_limits TO "${role}"`,
  );
  // Answer keys, attempts and payment tables deliberately have no runtime grants yet.
  console.log(
    "Applied Phase 1 runtime grants. Private question/answer and payment tables remain inaccessible.",
  );
} finally {
  await sql.end();
}
