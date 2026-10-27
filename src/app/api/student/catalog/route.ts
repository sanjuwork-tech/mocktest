import { requireStudent } from "@/server/auth";
import { apiError, json } from "@/server/http";
import { finalizeIfOverdue } from "@/server/deadline";
import {
  accessFor,
  activeProductIds,
  publishedTests,
  studentAttempts,
} from "@/server/student-tests";

export const runtime = "nodejs";

/** GET /api/student/catalog — every published test with the student's access and latest attempt. */
export async function GET() {
  try {
    const student = await requireStudent();
    const [tests, products] = await Promise.all([
      publishedTests(),
      activeProductIds(student.userId),
    ]);
    let attempts = await studentAttempts(student.userId);

    // Close out attempts whose time ran out while the student was away, so the catalog never offers to resume them.
    const overdue = attempts.filter((a) => a.status === "in_progress" && a.deadline <= new Date());
    if (overdue.length) {
      await Promise.all(overdue.map((a) => finalizeIfOverdue(a.attemptId)));
      attempts = await studentAttempts(student.userId);
    }

    const latestByTest = new Map<string, (typeof attempts)[number]>();
    for (const a of attempts) if (!latestByTest.has(a.testId)) latestByTest.set(a.testId, a);

    return json({
      student: { name: student.name, email: student.email },
      tests: tests.map((t) => {
        const latest = latestByTest.get(t.testId);
        return {
          testId: t.testId,
          title: t.title,
          exam: t.exam,
          subject: t.subject,
          testNumber: t.testNumber,
          durationMinutes: t.durationMinutes,
          totalMarks: t.totalMarks,
          access: accessFor(t, products),
          latestAttempt: latest
            ? {
                attemptId: latest.attemptId,
                status: latest.status,
                score: latest.score,
                maxScore: latest.maxScore,
                submittedAt: latest.submittedAt?.toISOString() ?? null,
              }
            : null,
        };
      }),
      recentAttempts: attempts.slice(0, 10).map((a) => ({
        attemptId: a.attemptId,
        testId: a.testId,
        title: a.title,
        status: a.status,
        score: a.score,
        maxScore: a.maxScore,
        startedAt: a.startedAt.toISOString(),
      })),
    });
  } catch (e) {
    return apiError(e);
  }
}
