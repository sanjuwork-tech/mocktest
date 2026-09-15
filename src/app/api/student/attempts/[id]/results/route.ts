import { NextRequest, NextResponse } from "next/server";
import { currentStudent } from "@/server/student-auth";
import { getAttemptResults, saveReflections } from "@/server/attempts";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const student = await currentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: attemptId } = await context.params;
  const data = await getAttemptResults(attemptId);
  if (!data) {
    return NextResponse.json({ error: "Results not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const student = await currentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: attemptId } = await context.params;

  try {
    const body = (await request.json()) as {
      reflections?: Record<string, string>;
    };
    if (!body.reflections) {
      return NextResponse.json(
        { error: "reflections object required" },
        { status: 400 },
      );
    }

    await saveReflections(attemptId, body.reflections);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save reflections";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
