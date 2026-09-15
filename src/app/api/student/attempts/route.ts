import { NextRequest, NextResponse } from "next/server";
import { currentStudent } from "@/server/student-auth";
import { listStudentAttempts, startAttempt } from "@/server/attempts";
import type { Subject } from "@/lib/student/model";

export async function GET() {
  const student = await currentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attempts = await listStudentAttempts(student);
  return NextResponse.json({ attempts });
}

export async function POST(request: NextRequest) {
  const student = await currentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { subject?: Subject };
    const subject = body.subject;
    if (!subject || !["mathematics", "physics", "chemistry"].includes(subject)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    const attemptData = await startAttempt(student, subject);
    return NextResponse.json(attemptData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to start attempt";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
