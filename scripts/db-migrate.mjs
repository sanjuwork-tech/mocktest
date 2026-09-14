import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { ownerConnection } from "./db-env.mjs";
const sql = ownerConnection();
try {
  await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
  console.log("Database migrations completed.");
} finally {
  await sql.end();
}
