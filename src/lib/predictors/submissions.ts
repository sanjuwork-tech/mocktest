/**
 * Shared by every OurMocks predictor tool (JEE Main, NEET, …): what a tool may send to
 * POST /api/tools/submissions, and a tiny browser helper that sends it.
 *
 * Inputs are stored without identity. An email is stored only with a consent basis
 * ("adult": the student is 18 or older; "guardian": a parent or guardian agrees).
 */

export type SubmissionValue = string | number | boolean | null;

export type ToolSubmission = {
  /** Tool id, lowercase letters, digits and hyphens, e.g. "jee-main-rank-predictor". */
  tool: string;
  /** The inputs the student entered: at most 20 flat keys, small values, no names or contact details. */
  inputs: Record<string, SubmissionValue>;
  email?: string;
  consentBasis?: "adult" | "guardian";
};

export const SUBMISSION_LIMITS = { maxKeys: 20, maxInputBytes: 1024, maxStringLength: 120 } as const;

export type SubmissionResult = { ok: true } | { ok: false; error: string };

/**
 * Posts a submission. Never throws: tools should keep working if recording fails.
 * Pass keepalive when the page navigates straight after (e.g. on form submit).
 */
export async function submitToolInputs(payload: ToolSubmission, options: { keepalive?: boolean } = {}): Promise<SubmissionResult> {
  try {
    const res = await fetch("/api/tools/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: options.keepalive,
    });
    if (res.ok) return { ok: true };
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "We couldn't save that just now. Please try again." };
  } catch {
    return { ok: false, error: "Network problem. Check your connection and try again." };
  }
}
