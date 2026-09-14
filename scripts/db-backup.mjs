import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { ownerConnection } from "./db-env.mjs";
const destination = process.argv[2];
if (!destination)
  throw new Error(
    "Provide a private output path, e.g. .local/backups/phase1.json",
  );
const sql = ownerConnection();
try {
  const snapshot = await sql.begin(
    "isolation level repeatable read read only",
    async (tx) => {
      const tables =
        await tx`select tablename from pg_tables where schemaname='public' order by tablename`;
      const history =
        await tx`select hash,created_at from drizzle.__drizzle_migrations order by created_at`;
      const data = {};
      for (const { tablename } of tables) {
        if (!/^[a-z_]+$/.test(tablename))
          throw new Error("Unexpected table name");
        const [row] = await tx.unsafe(
          `SELECT coalesce(jsonb_agg(t),'[]'::jsonb) AS rows FROM public."${tablename}" t`,
        );
        data[tablename] = row.rows;
      }
      return {
        format: "testdisha-logical-data-v1",
        createdAt: new Date().toISOString(),
        migrations: history,
        data,
      };
    },
  );
  await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
  await writeFile(destination, JSON.stringify(snapshot), {
    mode: 0o600,
    flag: "wx",
  });
  console.log(
    "Consistent logical data backup written. Protect it: it contains account records.",
  );
} finally {
  await sql.end();
}
