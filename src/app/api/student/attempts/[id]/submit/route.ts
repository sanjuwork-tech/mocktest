import { NextResponse } from "next/server";
import { currentStudent } from "@/server/student-auth";
import { submitAttempt } from "@/server/attempts";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const student = await currentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: attemptId } = await context.params;

  try {
    const result = await submitAttempt(attemptId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit attempt";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
