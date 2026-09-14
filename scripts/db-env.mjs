import nextEnv from "@next/env";
import postgres from "postgres";
nextEnv.loadEnvConfig(process.cwd());
export function ownerConnection() {
  const url = process.env.DATABASE_MIGRATION_URL;
  if (!url)
    throw new Error(
      "Set DATABASE_MIGRATION_URL for database administration; never use runtime credentials for migrations.",
    );
  return postgres(url, { prepare: false, max: 1, connect_timeout: 10 });
}

// CLI errors must never print SQL parameter arrays containing password hashes.
process.on("uncaughtException", (error) => {
  const code = error.cause?.code ?? error.code;
  console.error(
    code
      ? `Database operation failed (${code}). Check configuration and migration state.`
      : error.message,
  );
  process.exitCode = 1;
});
