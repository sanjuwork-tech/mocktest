import data from "./questions.json" with { type: "json" };
import type { Question, Subject } from "../../lib/student/model.ts";
export const questionBank = data as Question[];
export function questionsFor(subject: Subject) {
  return questionBank.filter((q) => q.subject === subject);
}
