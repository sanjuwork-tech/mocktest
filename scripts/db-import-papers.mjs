// Imports test-paper JSON files into the database (same validation as the admin upload).
//
//   npm run db:import-papers -- data/test-papers/cuet-ug            → import as drafts
//   npm run db:import-papers -- data/test-papers/cuet-ug --publish  → import and publish
//
// Accepts files or directories (searched recursively for *.json).
import fs from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { ownerConnection } from "./db-env.mjs";
import * as schema from "../src/db/schema.ts";
import { testPaperSchema } from "../src/lib/question-bank-schema.ts";
import { checkPaper, importTestPaper } from "../src/server/test-papers.ts";

const args = process.argv.slice(2);
const publish = args.includes("--publish");
const targets = args.filter((a) => !a.startsWith("--"));
if (!targets.length) throw new Error("Pass one or more test-paper files or directories.");

function collect(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return target.endsWith(".json") ? [target] : [];
  return fs
    .readdirSync(target)
    .sort()
    .flatMap((name) => collect(path.join(target, name)));
}

const files = targets.flatMap(collect);
const sql = ownerConnection();
try {
  const db = drizzle(sql, { schema });
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const [admin] = email
    ? await db.select({ id: schema.usersTable.id }).from(schema.usersTable).where(eq(schema.usersTable.email, email.toLowerCase()))
    : [];
  if (!admin) throw new Error("Run db:seed first so the bootstrap admin (ADMIN_BOOTSTRAP_EMAIL) exists.");

  let failed = 0;
  for (const file of files) {
    const parsed = testPaperSchema.safeParse(JSON.parse(fs.readFileSync(file, "utf8")));
    if (!parsed.success) {
      failed++;
      console.error(`✗ ${file}`);
      for (const issue of parsed.error.issues.slice(0, 5))
        console.error(`    ${issue.path.join(".")}: ${issue.message}`);
      continue;
    }
    const { blueprint, issues } = checkPaper(parsed.data);
    if (!blueprint) {
      failed++;
      console.error(`✗ ${file}`);
      for (const issue of issues.slice(0, 5)) console.error(`    ${issue.path}: ${issue.message}`);
      continue;
    }
    const result = await importTestPaper(db, parsed.data, blueprint, admin.id, { publish });
    if (result.unchanged) {
      console.log(`= ${result.title} unchanged (version ${result.version})`);
      continue;
    }
    console.log(
      `✓ ${result.title} → version ${result.version}${publish ? " (published)" : " (draft)"}` +
        (result.reusedQuestions ? `, ${result.reusedQuestions} unchanged questions reused` : ""),
    );
  }
  console.log(`${files.length - failed} imported, ${failed} failed.`);
  if (failed) process.exitCode = 1;
} finally {
  await sql.end();
}
