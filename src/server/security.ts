import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
export type AdminRole = "admin" | "reviewer" | "editor";
export function isStaff(role: string): role is AdminRole {
  return ["admin", "reviewer", "editor"].includes(role);
}
export function canPublish(role: string) {
  return role === "admin" || role === "reviewer";
}
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export function newSessionToken() {
  return randomBytes(32).toString("base64url");
}
let concurrentHashes = 0;
function derive(password: string, salt: string): Promise<Buffer> {
  if (concurrentHashes >= 3)
    return Promise.reject(new Error("Password service busy"));
  concurrentHashes++;
  return new Promise((resolve, reject) =>
    scrypt(
      password,
      salt,
      64,
      { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 },
      (error, key) => {
        concurrentHashes--;
        if (error) reject(error);
        else resolve(key);
      },
    ),
  );
}
export async function hashPassword(password: string) {
  if (password.length < 12 || password.length > 128)
    throw new Error("Use a password between 12 and 128 characters.");
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt);
  return `scrypt:131072:8:1:${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, encoded: string) {
  if (password.length > 128) return false;
  const parts = encoded.split(":");
  if (
    parts.length !== 6 ||
    parts.slice(0, 4).join(":") !== "scrypt:131072:8:1" ||
    !/^[a-f0-9]{32}$/.test(parts[4]) ||
    !/^[a-f0-9]{128}$/.test(parts[5])
  )
    return false;
  const key = await derive(password, parts[4]);
  return timingSafeEqual(key, Buffer.from(parts[5], "hex"));
}
// Same KDF work for an unknown user; this sentinel cannot authenticate an account.
export const DUMMY_PASSWORD_HASH =
  "scrypt:131072:8:1:" + "0".repeat(32) + ":" + "0".repeat(128);
export function allowedOrigin(origin: string | null, requestHost?: string | null) {
  if (!origin || origin === "null") return false;

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  const configuredList = [
    process.env.APP_ORIGIN,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_CANONICAL_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : undefined,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
  ].filter(Boolean) as string[];

  const allowed = new Set(
    configuredList
      .map((c) => {
        try {
          return new URL(c.startsWith("http") ? c : `https://${c}`).origin;
        } catch {
          return "";
        }
      })
      .filter(Boolean),
  );

  if (allowed.has(originUrl.origin)) {
    return true;
  }

  if (requestHost) {
    const cleanHost = requestHost.split(":")[0].toLowerCase();
    if (originUrl.hostname.toLowerCase() === cleanHost) {
      return true;
    }
  }

  if (
    (originUrl.hostname === "localhost" ||
      originUrl.hostname === "127.0.0.1" ||
      originUrl.hostname === "[::1]") &&
    (originUrl.protocol === "http:" || originUrl.protocol === "https:")
  ) {
    return true;
  }

  if (
    originUrl.protocol === "https:" &&
    (originUrl.hostname.endsWith(".vercel.app") || originUrl.hostname === "vercel.app")
  ) {
    return true;
  }

  return false;
}
export function rupeesToMinor(amount: number) {
  if (
    !Number.isFinite(amount) ||
    amount < 0 ||
    amount > 1000000 ||
    Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-7
  )
    throw new Error("Invalid rupee amount");
  return Math.round(amount * 100);
}
