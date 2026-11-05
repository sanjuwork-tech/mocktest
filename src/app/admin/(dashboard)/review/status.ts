// Pure review-status rules shared by the server (src/server/reviews.ts), the review screens and the test-papers list.

export type Verdict = "ok" | "issue";
export type QuestionState = "unreviewed" | "verified" | "issue";

/** A question with any "issue" verdict is open; otherwise one "ok" verdict verifies it. */
export function questionState(verdicts: Verdict[]): QuestionState {
  if (verdicts.includes("issue")) return "issue";
  return verdicts.includes("ok") ? "verified" : "unreviewed";
}

export type PaperCounts = { total: number; verified: number; issues: number };
export type PaperStatus = { kind: "none" | "in_review" | "verified" | "issues"; label: string };

export function paperStatus({ total, verified, issues }: PaperCounts): PaperStatus {
  if (issues > 0) return { kind: "issues", label: `${issues} issue${issues === 1 ? "" : "s"}` };
  if (total > 0 && verified >= total) return { kind: "verified", label: "Verified" };
  if (verified === 0) return { kind: "none", label: "Not reviewed" };
  return { kind: "in_review", label: `In review ${verified} of ${total}` };
}

/** Counts per paper from each question's verdicts. */
export function countPaper(questions: Verdict[][]): PaperCounts {
  const states = questions.map(questionState);
  return {
    total: questions.length,
    verified: states.filter((s) => s === "verified").length,
    issues: states.filter((s) => s === "issue").length,
  };
}

/** Trims the comment and enforces "comment required for an issue". Returns null when the input is not acceptable. */
export function normalizeVerdict(verdict: Verdict, comment: string | null | undefined) {
  const text = (comment ?? "").trim();
  if (verdict === "issue" && !text) return null;
  return { verdict, comment: text || null };
}
