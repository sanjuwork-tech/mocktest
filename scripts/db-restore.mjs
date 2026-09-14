import { readFile } from "node:fs/promises";
import { ownerConnection } from "./db-env.mjs";
const source = process.argv[2];
if (!source || process.argv[3] !== "--into-empty")
  throw new Error(
    "Usage: db:restore <private backup file> --into-empty. Point DATABASE_MIGRATION_URL at a separate, freshly migrated database.",
  );
const backup = JSON.parse(await readFile(source, "utf8"));
if (backup.format !== "testdisha-logical-data-v1")
  throw new Error("Unsupported backup.");
const sql = ownerConnection();
try {
  await sql.begin(async (tx) => {
    const history =
      await tx`select hash,created_at from drizzle.__drizzle_migrations order by created_at`;
    if (JSON.stringify(history) !== JSON.stringify(backup.migrations))
      throw new Error("Migration history does not match the backup.");
    const tables =
      await tx`select tablename from pg_tables where schemaname='public' order by tablename`;
    if (
      JSON.stringify(tables.map((t) => t.tablename)) !==
      JSON.stringify(Object.keys(backup.data).sort())
    )
      throw new Error("Table inventory does not match.");
    for (const { tablename } of tables) {
      if (!/^[a-z_]+$/.test(tablename))
        throw new Error("Unexpected table name");
      await tx.unsafe(`LOCK TABLE "${tablename}" IN ACCESS EXCLUSIVE MODE`);
    }
    for (const { tablename } of tables) {
      if (!/^[a-z_]+$/.test(tablename))
        throw new Error("Unexpected table name");
      const [row] = await tx.unsafe(
        `SELECT count(*)::int AS count FROM "${tablename}"`,
      );
      if (row.count !== 0)
        throw new Error(
          "Restore target is not empty; no records were changed.",
        );
    }
    const fks =
      await tx`select c.conrelid::regclass::text as child,c.confrelid::regclass::text as parent from pg_constraint c join pg_namespace n on n.oid=c.connamespace where c.contype='f' and n.nspname='public'`;
    const pending = new Set(tables.map((t) => t.tablename));
    const done = new Set();
    while (pending.size) {
      let progressed = false;
      for (const name of pending) {
        if (
          fks.some(
            (f) => f.child === name && f.parent !== name && !done.has(f.parent),
          )
        )
          continue;
        await tx.unsafe(
          `INSERT INTO "${name}" SELECT * FROM jsonb_populate_recordset(NULL::"${name}", $1::jsonb)`,
          [tx.json(backup.data[name])],
        );
        done.add(name);
        pending.delete(name);
        progressed = true;
      }
      if (!progressed)
        throw new Error(
          "Dependency cycle: restore needs an updated procedure.",
        );
    }
  });
  console.log("Restored into an empty database with matching migrations.");
} finally {
  await sql.end();
}
