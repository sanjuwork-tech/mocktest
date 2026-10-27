import { z } from "zod";
import { apiError, json, readJson, requireOrigin } from "@/server/http";
import { studentLogin } from "@/server/auth";

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

    const user = await studentLogin(parsed.data.email, parsed.data.password);
    return json({ ok: true, user: { id: user.userId, name: user.name, email: user.email } });
  } catch (e) {
    return apiError(e);
  }
}
