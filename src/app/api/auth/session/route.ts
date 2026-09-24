import { apiError, json } from "@/server/http";
import { currentStudent } from "@/server/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const student = await currentStudent();
    if (!student) {
      return json({ authenticated: false }, 401);
    }

    return json({
      authenticated: true,
      user: {
        id: student.userId,
        name: student.name,
        email: student.email,
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
