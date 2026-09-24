import { cookies } from "next/headers";
import { apiError, json, requireOrigin } from "@/server/http";
import { studentLogout, STUDENT_COOKIE } from "@/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireOrigin(request);
    await studentLogout();

    const cookieStore = await cookies();
    cookieStore.set(STUDENT_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
