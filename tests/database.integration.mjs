import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
const repo = process.cwd();
const require = createRequire(repo + "/package.json");
const nextEnv = require("@next/env");
nextEnv.loadEnvConfig(repo);
const postgres = require("postgres");
const { drizzle } = require("drizzle-orm/postgres-js");
const { migrate } = require("drizzle-orm/postgres-js/migrator");
const original = process.env.DATABASE_MIGRATION_URL;
const root = new URL(original);
if (!["localhost", "127.0.0.1"].includes(root.hostname))
  throw new Error(
    "Database lifecycle tests require local disposable infrastructure.",
  );
root.pathname = "/postgres";
const admin = postgres(root.toString(), { max: 1, onnotice: () => {} });
const suffix = Date.now().toString();
const legacyName = "testdisha_migration_" + suffix,
  restoreName = "testdisha_restore_" + suffix;
const folder = repo + "/.local/verification-" + suffix;
await mkdir(folder + "/meta", { recursive: true, mode: 0o700 });
let legacy, restored;
function url(name) {
  const u = new URL(original);
  u.pathname = "/" + name;
  return u.toString();
}
function run(script, args = [], env = {}) {
  const r = spawnSync(
    process.execPath,
    [repo + "/scripts/" + script, ...args],
    { cwd: repo, env: { ...process.env, ...env }, encoding: "utf8" },
  );
  if (r.status !== 0)
    throw new Error(script + " failed: " + r.stdout + r.stderr);
  console.log(r.stdout.trim());
}
try {
  await admin.unsafe(`CREATE DATABASE "${legacyName}" OWNER testdisha_owner`);
  legacy = postgres(url(legacyName), { max: 1, onnotice: () => {} });
  const journal = JSON.parse(
    await readFile(repo + "/drizzle/meta/_journal.json", "utf8"),
  );
  await writeFile(
    folder + "/meta/_journal.json",
    JSON.stringify({ ...journal, entries: [journal.entries[0]] }),
  );
  await writeFile(
    folder + "/" + journal.entries[0].tag + ".sql",
    await readFile(repo + "/drizzle/" + journal.entries[0].tag + ".sql"),
  );
  await migrate(drizzle(legacy), { migrationsFolder: folder });
  const [p] =
    await legacy`insert into products (slug,exam,title,description,price,compare_at_price,mock_count) values ('legacy-fixture','IAT','Legacy fixture','Existing records must survive Phase 1.',1499,2499,45) returning id`;
  const [o] =
    await legacy`insert into orders (customer_name,email,product_slug,amount) values ('Legacy fixture','legacy@example.test','legacy-fixture',1499) returning id`;
  await migrate(drizzle(legacy), { migrationsFolder: repo + "/drizzle" });
  await migrate(drizzle(legacy), { migrationsFolder: repo + "/drizzle" });
  const [up] = await legacy`select * from products where id=${p.id}`;
  const [uo] = await legacy`select * from orders where id=${o.id}`;
  assert.equal(up.price, 149900);
  assert.equal(up.compare_at_price, 249900);
  assert.equal(uo.amount, 149900);
  assert.equal(uo.product_id, p.id);
  console.log(
    "Legacy migration preserves IDs/data and converts rupees to paise exactly once.",
  );
  const [fixtureUser] =
    await legacy`insert into users (email,name,password_hash) values ('lifecycle@example.test','Lifecycle fixture','not-an-authenticatable-password') returning id`;
  const [fixtureTest] =
    await legacy`insert into tests (product_id,title,duration_minutes,total_marks) values (${p.id},'Lifecycle fixture',60,4) returning id`;
  const [v1] =
    await legacy`insert into test_versions (test_id,version,title,duration_seconds,rules) values (${fixtureTest.id},1,'Version one',3600,'{}') returning id`;
  const [v2] =
    await legacy`insert into test_versions (test_id,version,title,duration_seconds,rules) values (${fixtureTest.id},2,'Version two',3600,'{}') returning id`;
  const [section] =
    await legacy`insert into test_sections (test_version_id,subject,position) values (${v1.id},'mathematics',0) returning id`;
  const [question] =
    await legacy`insert into question_bank (external_id) values ('lifecycle-question') returning id`;
  const [revision] =
    await legacy`insert into question_revisions (question_id,revision,type,subject,topics,content,source,created_by) values (${question.id},1,'single_choice','mathematics','[]','{}','{}',${fixtureUser.id}) returning id`;
  const [assignment] =
    await legacy`insert into test_assignments (test_version_id,section_id,revision_id,position,marks) values (${v1.id},${section.id},${revision.id},0,4) returning id`;
  const [attempt] =
    await legacy`insert into attempts (user_id,test_version_id,idempotency_key,deadline,ordering) values (${fixtureUser.id},${v2.id},'lifecycle-attempt',now()+interval '1 hour','[]') returning id`;
  await assert.rejects(
    legacy`insert into attempt_answers (attempt_id,assignment_id,test_version_id,value,sequence) values (${attempt.id},${assignment.id},${v2.id},'[]',1)`,
    (e) => e.code === "23503",
  );
  await assert.rejects(
    legacy`insert into attempt_answers (attempt_id,assignment_id,test_version_id,value,sequence) values (${attempt.id},${assignment.id},${v1.id},'[]',1)`,
    (e) => e.code === "23503",
  );
  await assert.rejects(
    legacy`update products set sales_enabled=true where id=${p.id}`,
    (e) => e.code === "23514",
  );
  await assert.rejects(
    legacy`update products set price=-1 where id=${p.id}`,
    (e) => e.code === "23514",
  );
  console.log(
    "Database rejects cross-version answers, invalid money and premature sales.",
  );
  const backup = folder + "/backup.json";
  run("db-backup.mjs", [backup]);
  await admin.unsafe(`CREATE DATABASE "${restoreName}" OWNER testdisha_owner`);
  restored = postgres(url(restoreName), { max: 1, onnotice: () => {} });
  await migrate(drizzle(restored), { migrationsFolder: repo + "/drizzle" });
  run("db-restore.mjs", [backup, "--into-empty"], {
    DATABASE_MIGRATION_URL: url(restoreName),
  });
  const snapshot = JSON.parse(await readFile(backup, "utf8"));
  for (const [table, rows] of Object.entries(snapshot.data)) {
    const [count] = await restored.unsafe(
      `select count(*)::int as count from "${table}"`,
    );
    assert.equal(count.count, rows.length, table);
    const [actual] = await restored.unsafe(
      `select coalesce(jsonb_agg(t),'[]'::jsonb) as rows from "${table}" t`,
    );
    const sort = (values) =>
      values.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    assert.deepEqual(sort(actual.rows), sort(rows), table + " values");
  }
  const { verifyPassword } = await import(
    pathToFileURL(repo + "/src/server/security.ts")
  );
  const [user] =
    await restored`select password_hash from users where email=${process.env.ADMIN_BOOTSTRAP_EMAIL}`;
  assert.ok(
    await verifyPassword(
      process.env.ADMIN_BOOTSTRAP_PASSWORD,
      user.password_hash,
    ),
  );
  const repeat = spawnSync(
    process.execPath,
    [repo + "/scripts/db-restore.mjs", backup, "--into-empty"],
    {
      cwd: repo,
      env: { ...process.env, DATABASE_MIGRATION_URL: url(restoreName) },
      encoding: "utf8",
    },
  );
  assert.notEqual(repeat.status, 0);
  console.log(
    "25-table backup restored; account password verified; non-empty restore safely rejected.",
  );
} finally {
  await legacy?.end();
  await restored?.end();
  await admin.unsafe(`DROP DATABASE IF EXISTS "${legacyName}"`);
  await admin.unsafe(`DROP DATABASE IF EXISTS "${restoreName}"`);
  await admin.end();
  // Private verification artifacts are retained locally, never staged.
}
