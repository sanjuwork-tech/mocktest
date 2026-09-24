import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";
const connectionString = process.env.DATABASE_URL;
const globalDb = globalThis as unknown as {
  testdishaSql?: ReturnType<typeof postgres>;
};
function client() {
  if (!connectionString) return null;
  const configuredMax = process.env.DATABASE_POOL_SIZE
    ? Number(process.env.DATABASE_POOL_SIZE)
    : undefined;
  const max =
    configuredMax ?? (process.env.NODE_ENV === "production" ? 20 : 3);
  if (!Number.isInteger(max) || max < 1 || max > 50)
    throw new Error("Invalid database pool size");
  return (
    globalDb.testdishaSql ??
    postgres(connectionString, {
      prepare: false,
      max,
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30, // 30 minutes to recycle long-lived connections
      connection: {
        application_name: "testdisha-app",
        statement_timeout: 10000,
      },
    })
  );
}
const sqlClient = client();
if (sqlClient && process.env.NODE_ENV !== "production")
  globalDb.testdishaSql = sqlClient;
export const db = sqlClient ? drizzle(sqlClient, { schema }) : null;
export const databaseConfigured = Boolean(connectionString);
export function requireDb() {
  if (!db) throw new Error("Database unavailable");
  return db;
}
