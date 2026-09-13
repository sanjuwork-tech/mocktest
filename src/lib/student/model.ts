export type Subject = "mathematics" | "physics" | "chemistry";
export type QuestionType =
  | "single"
  | "multiple"
  | "numerical"
  | "integer"
  | "true_false"
  | "assertion_reason"
  | "passage"
  | "match"
  | "ordering"
  | "graph";
export type Question = {
  id: string;
  subject: Subject;
  type: QuestionType;
  topic: string;
  difficulty: "Foundation" | "Standard" | "Stretch";
  prompt: string;
  passage?: string;
  options?: string[];
  left?: string[];
  right?: string[];
  graph?: {
    xLabel: string;
    yLabel: string;
    points: { x: number; y: number }[];
  };
  correct: string | string[];
  tolerance?: number;
  explanation: string;
  tip: string;
  targetSeconds: number;
};
export type Response = {
  value: string | string[];
  confidence?: "low" | "medium" | "high";
  seconds: number;
  marked: boolean;
  changes: number;
};
export type Attempt = {
  id: string;
  subject: Subject;
  startedAt: number;
  deadline: number;
  submittedAt?: number;
  timedOut?: boolean;
  sample?: boolean;
  current: number;
  responses: Record<string, Response>;
  reflections: Record<string, string>;
};
export type DemoState = { version: 1; signedIn: boolean; attempts: Attempt[] };
export const SUBJECTS: {
  id: Subject;
  title: string;
  subtitle: string;
  color: string;
}[] = [
  {
    id: "mathematics",
    title: "Mathematics",
    subtitle: "Find the logic. Build your confidence.",
    color: "#1f5eff",
  },
  {
    id: "physics",
    title: "Physics",
    subtitle: "Turn the world around you into understanding.",
    color: "#406900",
  },
  {
    id: "chemistry",
    title: "Chemistry",
    subtitle: "Small connections. Stronger concepts.",
    color: "#a63b22",
  },
];
export const TYPE_LABELS: Record<QuestionType, string> = {
  single: "Single correct",
  multiple: "Multiple correct",
  numerical: "Numerical answer",
  integer: "Integer answer",
  true_false: "True / false",
  assertion_reason: "Assertion & reason",
  passage: "Passage based",
  match: "Match the columns",
  ordering: "Arrange in order",
  graph: "Graph interpretation",
};
export const EMPTY_RESPONSE: Response = {
  value: "",
  seconds: 0,
  marked: false,
  changes: 0,
};
export function answered(q: Question, r?: Response): boolean {
  if (!r) return false;
  if (q.type === "match" || q.type === "ordering")
    return (
      Array.isArray(r.value) &&
      r.value.length ===
        (q.type === "match" ? q.left!.length : q.options!.length) &&
      r.value.every((x) => x !== "")
    );
  return Array.isArray(r.value) ? r.value.length > 0 : r.value.trim() !== "";
}
export function correct(q: Question, r?: Response): boolean {
  if (!answered(q, r)) return false;
  if (q.type === "numerical" || q.type === "integer") {
    const raw = String(r!.value).trim();
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw)) return false;
    const n = Number(raw);
    if (!Number.isFinite(n) || (q.type === "integer" && !Number.isInteger(n)))
      return false;
    return (
      Math.abs(n - Number(q.correct)) <= (q.tolerance ?? 0) + Number.EPSILON * 8
    );
  }
  if (Array.isArray(q.correct)) {
    if (!Array.isArray(r!.value) || new Set(r!.value).size !== r!.value.length)
      return false;
    const actual = q.type === "multiple" ? [...r!.value].sort() : r!.value;
    const expected = q.type === "multiple" ? [...q.correct].sort() : q.correct;
    return JSON.stringify(actual) === JSON.stringify(expected);
  }
  return r!.value === q.correct;
}
export function analyze(questions: Question[], attempt: Attempt) {
  const rows = questions.map((q, index) => {
    const response = attempt.responses[q.id];
    const attempted = answered(q, response);
    const isCorrect = correct(q, response);
    return {
      q,
      index: index + 1,
      response,
      attempted,
      isCorrect,
      status: isCorrect ? "Correct" : attempted ? "Incorrect" : "Unanswered",
      seconds: response?.seconds ?? 0,
      points: isCorrect ? 4 : attempted ? -1 : 0,
    };
  });
  const right = rows.filter((r) => r.isCorrect).length;
  const wrong = rows.filter((r) => r.attempted && !r.isCorrect).length;
  const topics = [...new Set(questions.map((q) => q.topic))]
    .map((topic) => {
      const subset = rows.filter((r) => r.q.topic === topic);
      const attempted = subset.filter((r) => r.attempted).length;
      const right = subset.filter((r) => r.isCorrect).length;
      return {
        topic,
        total: subset.length,
        attempted,
        correct: right,
        wrong: attempted - right,
        unanswered: subset.length - attempted,
        accuracy: attempted ? Math.round((right / attempted) * 100) : null,
        seconds: subset.reduce((s, r) => s + r.seconds, 0),
        priority: (attempted - right) * 5 + (subset.length - attempted) * 4,
      };
    })
    .sort((a, b) => b.priority - a.priority || a.topic.localeCompare(b.topic));
  return {
    rows,
    topics,
    right,
    wrong,
    unanswered: questions.length - right - wrong,
    score: right * 4 - wrong,
    max: questions.length * 4,
    accuracy:
      right + wrong ? Math.round((right / (right + wrong)) * 100) : null,
    activeSeconds: rows.reduce((s, r) => s + r.seconds, 0),
    overconfident: rows.filter(
      (r) => r.attempted && !r.isCorrect && r.response?.confidence === "high",
    ),
    uncertainCorrect: rows.filter(
      (r) => r.isCorrect && r.response?.confidence === "low",
    ),
    slowWrong: rows.filter(
      (r) => r.attempted && !r.isCorrect && r.seconds > r.q.targetSeconds,
    ),
  };
}
