import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getGoogleOAuthUrl, OAUTH_STATE_COOKIE } from "@/server/student-auth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const state = randomBytes(24).toString("base64url");

  let authUrl: string;
  try {
    authUrl = getGoogleOAuthUrl(origin, state);
  } catch {
    return NextResponse.redirect(`${origin}/student/login?error=google_unavailable`);
  }

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/api/auth/google",
  });
  return response;
}
