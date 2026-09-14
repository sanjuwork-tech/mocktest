import nextEnv from "@next/env";
import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
nextEnv.loadEnvConfig(process.cwd());
const action = process.argv[2] ?? "start";
if (!["start", "stop", "status"].includes(action))
  throw new Error("Use start, stop or status.");
const bin = process.env.PG_BIN,
  cluster = join(process.cwd(), ".local", "postgres");
if (!bin || !existsSync(join(cluster, "PG_VERSION")))
  throw new Error(
    "This command needs an initialized native local database and PG_BIN. Otherwise use the PostgreSQL service in compose.yaml.",
  );
const ctl = join(bin, "pg_ctl");
if (
  action === "start" &&
  spawnSync(ctl, ["-D", cluster, "status"], { stdio: "ignore" }).status === 0
) {
  console.log("Local PostgreSQL is already running on port 5433.");
  process.exit(0);
}
const socket =
  process.platform === "darwin"
    ? "/private/tmp/testdisha-pg-socket"
    : join(tmpdir(), "testdisha-pg-socket");
mkdirSync(socket, { recursive: true, mode: 0o700 });
const args = ["-D", cluster];
if (action === "start")
  args.push(
    "-l",
    join(process.cwd(), ".local", "postgres.log"),
    "-o",
    `-h 127.0.0.1 -p 5433 -k ${socket}`,
    "-w",
  );
if (action === "stop") args.push("-m", "fast");
args.push(action);
process.exitCode = spawnSync(ctl, args, { stdio: "inherit" }).status ?? 1;
