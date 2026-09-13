import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL;
const queryClient = connectionString ? postgres(connectionString, { prepare: false, max: 1 }) : null;

export const db = queryClient ? drizzle(queryClient, { schema }) : null;
export const databaseConfigured = Boolean(connectionString);
