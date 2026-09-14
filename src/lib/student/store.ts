"use client";
import { useMemo, useSyncExternalStore } from "react";
import { questionsFor } from "@/data/student/bank";
import {
  EMPTY_RESPONSE,
  type Attempt,
  type DemoState,
  type Response,
  type Subject,
} from "./model";
const KEY = "testdisha-student-demo-v1";
const LEGACY_KEY = "mockstride-student-demo-v1";
const EMPTY: DemoState = { version: 1, signedIn: false, attempts: [] };
const EMPTY_JSON = JSON.stringify(EMPTY);
let memory = EMPTY_JSON;
let warning = "";
let memoryOnly = false;
function read() {
  if (memoryOnly) return memory;
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    memory = raw ?? EMPTY_JSON;
    return memory;
  } catch {
    memoryOnly = true;
    warning =
      "Browser storage is unavailable. This session works in memory, but a refresh may lose your progress.";
    return memory;
  }
}
function parse(raw: string): DemoState {
  try {
    const v = JSON.parse(raw);
    if (
      v.version === 1 &&
      typeof v.signedIn === "boolean" &&
      Array.isArray(v.attempts) &&
      v.attempts.every(
        (a: Attempt) =>
          a &&
          typeof a.id === "string" &&
          ["mathematics", "physics", "chemistry"].includes(a.subject) &&
          Number.isFinite(a.deadline) &&
          a.responses &&
          a.reflections,
      )
    )
      return v;
  } catch {}
  return EMPTY;
}
function subscribe(fn: () => void) {
  window.addEventListener("storage", fn);
  window.addEventListener("student-demo-change", fn);
  return () => {
    window.removeEventListener("storage", fn);
    window.removeEventListener("student-demo-change", fn);
  };
}
export function useDemo() {
  const raw = useSyncExternalStore(subscribe, read, () => EMPTY_JSON);
  return useMemo(() => parse(raw), [raw]);
}
export function useReady() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
export function storageWarning() {
  return warning;
}
export function mutate(fn: (s: DemoState) => DemoState) {
  const next = fn(parse(read()));
  memory = JSON.stringify(next);
  try {
    localStorage.setItem(KEY, memory);
    warning = "";
  } catch {
    memoryOnly = true;
    warning =
      "Progress could not be saved to this browser. Keep this tab open; refreshing may lose this session.";
  }
  window.dispatchEvent(new Event("student-demo-change"));
}
export function signIn() {
  mutate((s) => ({ ...s, signedIn: true }));
}
export function signOut() {
  mutate((s) => ({ ...s, signedIn: false }));
}
export function startAttempt(subject: Subject) {
  const a: Attempt = {
    id: crypto.randomUUID(),
    subject,
    startedAt: Date.now(),
    deadline: Date.now() + 90 * 60_000,
    current: 0,
    responses: {},
    reflections: {},
  };
  mutate((s) => ({ ...s, attempts: [a, ...s.attempts] }));
  return a.id;
}
export function updateAttempt(id: string, fn: (a: Attempt) => Attempt) {
  mutate((s) => ({
    ...s,
    attempts: s.attempts.map((a) => (a.id === id ? fn(a) : a)),
  }));
}
export function setResponse(id: string, qid: string, patch: Partial<Response>) {
  updateAttempt(id, (a) =>
    a.submittedAt || Date.now() >= a.deadline
      ? a
      : {
          ...a,
          responses: {
            ...a.responses,
            [qid]: { ...EMPTY_RESPONSE, ...a.responses[qid], ...patch },
          },
        },
  );
}
export function finishAttempt(id: string, timedOut = false) {
  updateAttempt(id, (a) =>
    a.submittedAt
      ? a
      : {
          ...a,
          submittedAt: Math.min(Date.now(), a.deadline),
          timedOut: timedOut || Date.now() >= a.deadline,
        },
  );
}
export function createSample(subject: Subject) {
  const qs = questionsFor(subject);
  const end = Date.now();
  const responses: Record<string, Response> = {};
  qs.forEach((q, i) => {
    if (i % 7 === 0) return;
    let value: string | string[] = q.correct;
    if (i % 4 === 0 || i % 10 === 2) {
      if (q.type === "numerical" || q.type === "integer")
        value = String(Number(q.correct) + 2);
      else if (q.type === "match" || q.type === "ordering")
        value = [...(q.correct as string[])].reverse();
      else if (q.type === "multiple") value = ["1"];
      else value = String((Number(q.correct) + 1) % (q.options?.length ?? 4));
    }
    responses[q.id] = {
      value,
      confidence: i % 3 === 0 ? "high" : i % 3 === 1 ? "medium" : "low",
      seconds: 40 + ((i * 37) % 160),
      marked: i % 5 === 0,
      changes: i % 4,
    };
  });
  const elapsedMs =
    (Object.values(responses).reduce((sum, r) => sum + r.seconds, 0) + 180) *
    1000;
  const a: Attempt = {
    id: crypto.randomUUID(),
    subject,
    startedAt: end - elapsedMs,
    deadline: end - elapsedMs + 90 * 60_000,
    submittedAt: end,
    sample: true,
    current: 0,
    responses,
    reflections: {},
  };
  mutate((s) => ({ ...s, attempts: [a, ...s.attempts] }));
  return a.id;
}
