import { NextRequest, NextResponse } from "next/server";
import { createStudentSession } from "@/server/student-auth";

export async function POST(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;
    await createStudentSession({
      email: `guest_${Date.now()}@testdisha.demo`,
      name: "Guest Aspirant",
      provider: "guest",
      isGuest: true,
    });

    return NextResponse.json({ success: true, redirect: `${origin}/student` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Guest session creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
