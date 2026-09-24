import { z } from "zod";
import { cookies } from "next/headers";
import { apiError, json, readJson, requireOrigin } from "@/server/http";
import { studentLogin, STUDENT_COOKIE, STUDENT_SESSION_SECONDS } from "@/server/auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  try {
    requireOrigin(request);

    const body = await readJson(request, 16384);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "Please provide a valid email and password." }, 400);
    }

    const result = await studentLogin(parsed.data.email, parsed.data.password);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(STUDENT_COOKIE, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: STUDENT_SESSION_SECONDS,
    });

    return json({
      ok: true,
      user: {
        id: result.userId,
        name: result.name,
        email: result.email,
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
