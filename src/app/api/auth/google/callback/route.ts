import { NextRequest, NextResponse } from "next/server";
import {
  createStudentSession,
  exchangeGoogleCode,
  mockGoogleLoginAllowed,
  OAUTH_STATE_COOKIE,
} from "@/server/student-auth";
import { safeEqual } from "@/server/security";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const origin = url.origin;
  const fail = (code: string) => {
    const response = NextResponse.redirect(`${origin}/student/login?error=${code}`);
    response.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/api/auth/google" });
    return response;
  };

  // Reject callbacks this browser did not start (login CSRF).
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const state = url.searchParams.get("state");
  if (!expectedState || !state || !safeEqual(state, expectedState)) {
    return fail("invalid_state");
  }

  try {
    if (url.searchParams.get("mock") === "true") {
      if (!mockGoogleLoginAllowed()) return fail("google_unavailable");
      await createStudentSession({
        email: "arjun.student@example.com",
        name: "Arjun Sharma",
        provider: "google_mock",
        avatarUrl: null,
      });
    } else {
      const code = url.searchParams.get("code");
      if (!code) return fail("no_code");

      const redirectUri = `${origin}/api/auth/google/callback`;
      const profile = await exchangeGoogleCode(code, redirectUri);

      await createStudentSession({
        email: profile.email,
        name: profile.name,
        provider: "google",
        providerId: profile.providerId,
        avatarUrl: profile.avatarUrl,
      });
    }

    const response = NextResponse.redirect(`${origin}/student`);
    response.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/api/auth/google" });
    return response;
  } catch (err: unknown) {
    console.error("Google Auth error:", err instanceof Error ? err.message : err);
    return fail("google_failed");
  }
}
