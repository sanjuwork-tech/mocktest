import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "mockstride_admin";

function secret() { return process.env.AUTH_SECRET ?? "development-only-secret"; }
export function adminToken() { return createHash("sha256").update(`${process.env.ADMIN_PASSWORD ?? ""}:${secret()}`).digest("hex"); }
export function validPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const one = Buffer.from(input);
  const two = Buffer.from(expected);
  return one.length === two.length && timingSafeEqual(one, two);
}
export async function isAdmin() { return (await cookies()).get(ADMIN_COOKIE)?.value === adminToken() && Boolean(process.env.ADMIN_PASSWORD); }
