import { z } from "zod";
import { login, ADMIN_COOKIE, SESSION_SECONDS } from "@/server/auth";
import {
  apiError,
  ApiError,
  json,
  readJson,
  requireOrigin,
} from "@/server/http";
export const runtime = "nodejs";
const input = z
  .object({ email: z.email().max(254), password: z.string().min(1).max(128) })
  .strict();
export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const parsed = input.safeParse(await readJson(request, 2048));
    if (!parsed.success)
      throw new ApiError(400, "Enter a valid email and password.");
    const session = await login(parsed.data.email, parsed.data.password);
    const response = json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_SECONDS,
      expires: session.expiresAt,
    });
    response.cookies.delete("mockstride_admin");
    return response;
  } catch (e) {
    return apiError(e);
  }
}
