import { NextRequest, NextResponse } from "next/server";
import {
  createStudentSession,
  exchangeGoogleCode,
} from "@/server/student-auth";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const isMock = url.searchParams.get("mock") === "true";
  const code = url.searchParams.get("code");
  const origin = url.origin;

  try {
    if (isMock) {
      // Local development mock login
      await createStudentSession({
        email: "arjun.student@example.com",
        name: "Arjun Sharma",
        provider: "google_mock",
        avatarUrl: null,
      });
      return NextResponse.redirect(`${origin}/student`);
    }

    if (!code) {
      return NextResponse.redirect(`${origin}/student/login?error=no_code`);
    }

    const redirectUri = `${origin}/api/auth/google/callback`;
    const profile = await exchangeGoogleCode(code, redirectUri);

    await createStudentSession({
      email: profile.email,
      name: profile.name,
      provider: "google",
      providerId: profile.providerId,
      avatarUrl: profile.avatarUrl,
    });

    return NextResponse.redirect(`${origin}/student`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    console.error("Google Auth error:", message);
    return NextResponse.redirect(
      `${origin}/student/login?error=${encodeURIComponent(message)}`,
    );
  }
}
