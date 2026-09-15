import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/server/student-auth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const state = request.nextUrl.searchParams.get("state") || "student_auth";
  const authUrl = getGoogleOAuthUrl(origin, state);
  return NextResponse.redirect(authUrl);
}
