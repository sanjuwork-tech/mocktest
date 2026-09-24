import { eq, inArray } from "drizzle-orm";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json } from "@/server/http";
import { requireDb } from "@/db/client";
import {
  attemptsTable,
  attemptResultsTable,
  testsTable,
} from "@/db/schema";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = requireDb();

    // Verify test exists
    const [test] = await db
      .select()
      .from(testsTable)
      .where(eq(testsTable.id, id));

    if (!test) throw new ApiError(404, "Test not found");

    // Fetch all finished attempts
    const attempts = await db
      .select()
      .from(attemptsTable)
      .where(inArray(attemptsTable.status, ["submitted", "timed_out"]));

    // Filter for this test version
    const testAttempts = attempts.filter((a) => a.testVersionId === id);
    const attemptIds = testAttempts.map((a) => a.id);

    if (attemptIds.length === 0) {
      return json({
        totalParticipants: 0,
        averageScore: 0,
        maxPossibleScore: 0,
        highScore: 0,
        lowScore: 0,
        distribution: [],
        recentAttempts: [],
      });
    }

    // Fetch results
    const results = await db
      .select()
      .from(attemptResultsTable)
      .where(inArray(attemptResultsTable.attemptId, attemptIds));

    if (results.length === 0) {
      return json({
        totalParticipants: attemptIds.length,
        averageScore: 0,
        maxPossibleScore: 0,
        highScore: 0,
        lowScore: 0,
        distribution: [],
        recentAttempts: [],
      });
    }

    // Aggregate statistics
    let totalScore = 0;
    const maxPossibleScore = results[0].maxScore || 0;
    let highScore = -Infinity;
    let lowScore = Infinity;

    // Build 10 buckets for distribution
    const bucketCount = 10;
    const distribution = Array.from({ length: bucketCount }, (_, i) => ({
      range: `${(i * 10)}%-${((i + 1) * 10)}%`,
      count: 0,
    }));

    for (const result of results) {
      totalScore += result.score;
      if (result.score > highScore) highScore = result.score;
      if (result.score < lowScore) lowScore = result.score;

      const percentage = maxPossibleScore > 0 ? (result.score / maxPossibleScore) * 100 : 0;
      let bucketIndex = Math.floor(percentage / 10);
      if (bucketIndex >= bucketCount) bucketIndex = bucketCount - 1;
      if (bucketIndex < 0) bucketIndex = 0;
      distribution[bucketIndex].count++;
    }

    const averageScore = Math.round((totalScore / results.length) * 10) / 10;

    // Join basic attempt data for recent list
    const recentAttempts = results
      .map((r) => {
        const attempt = testAttempts.find((a) => a.id === r.attemptId);
        return {
          id: r.attemptId,
          userId: attempt?.userId,
          score: r.score,
          accuracy: maxPossibleScore > 0 ? Math.round((r.score / maxPossibleScore) * 100) : 0,
          submittedAt: attempt?.submittedAt,
        };
      })
      .sort((a, b) => {
        if (!a.submittedAt || !b.submittedAt) return 0;
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      })
      .slice(0, 10);

    return json({
      totalParticipants: results.length,
      averageScore,
      maxPossibleScore,
      highScore,
      lowScore,
      distribution,
      recentAttempts,
    });
  } catch (e) {
    return apiError(e);
  }
}
