// Client-side helpers for the student API. Server errors arrive as { error: string }.

export class ApiFailure extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  let response: Response;
  try {
    response = await fetch(path, {
      ...rest,
      headers: json === undefined ? rest.headers : { "Content-Type": "application/json", ...rest.headers },
      body: json === undefined ? rest.body : JSON.stringify(json),
    });
  } catch {
    throw new ApiFailure(0, "You appear to be offline. Check your connection and try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiFailure(response.status, data.error ?? "Something went wrong. Please try again.");
  return data as T;
}

export type CatalogTest = {
  testId: string;
  title: string;
  exam: string;
  subject: string | null;
  testNumber: number;
  durationMinutes: number;
  totalMarks: number;
  access: "free" | "unlocked" | "locked";
  latestAttempt: {
    attemptId: string;
    status: "in_progress" | "submitted" | "timed_out";
    score: number | null;
    maxScore: number | null;
    submittedAt: string | null;
  } | null;
};

export type Catalog = {
  student: { name: string; email: string };
  tests: CatalogTest[];
  recentAttempts: {
    attemptId: string;
    testId: string;
    title: string;
    status: "in_progress" | "submitted" | "timed_out";
    score: number | null;
    maxScore: number | null;
    startedAt: string;
  }[];
};

export function newIdempotencyKey() {
  return crypto.randomUUID();
}
