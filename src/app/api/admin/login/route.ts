import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken, validPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!validPassword(String(body.password ?? ""))) return NextResponse.json({ error: "Invalid password or ADMIN_PASSWORD is not configured." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, adminToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
