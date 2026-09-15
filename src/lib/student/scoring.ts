/**
 * Pure scoring utilities — no server-only dependency.
 * Safe to import from both server modules and test files.
 */
import type { Question } from "./model.ts";

export type SanitizedQuestion = Omit<Question, "correct" | "explanation">;

/**
 * Strip answer-revealing fields from a question before sending to the client.
 */
export function sanitizeQuestion(q: Question): SanitizedQuestion {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { correct, explanation, ...safe } = q;
  return safe;
}
