import { NextResponse } from "next/server";
import { currentStudent } from "@/server/student-auth";
import { submitAttempt } from "@/server/attempts";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const student = await currentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: attemptId } = await context.params;

  try {
    let responses = undefined;
    try {
      const body = (await request.json()) as { responses?: Record<string, import("@/lib/student/model").Response> };
      if (body && typeof body.responses === "object") {
        responses = body.responses;
      }
    } catch {
      // Body is optional
    }

    const result = await submitAttempt(attemptId, responses);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit attempt";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
