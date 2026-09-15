import { NextRequest, NextResponse } from "next/server";
import { currentStudent } from "@/server/student-auth";
import { recordAnswer } from "@/server/attempts";
import type { Response } from "@/lib/student/model";

export async function POST(
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
      questionId?: string;
      response?: Response;
    };

    if (!body.questionId || !body.response) {
      return NextResponse.json(
        { error: "questionId and response are required" },
        { status: 400 },
      );
    }

    const res = await recordAnswer(attemptId, body.questionId, body.response);
    return NextResponse.json(res);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record answer";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
