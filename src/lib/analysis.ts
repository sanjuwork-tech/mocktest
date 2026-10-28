// Post-test analysis built from outcomes plus behaviour: time on each question, visits, answer changes
// and review marks. Pure functions so the same logic serves the results page, the overall analysis
// page and tests.

export type AnalysisQuestion = {
  number: number; // position within its section, as the student saw it
  sectionId: string;
  sectionName: string;
  topics: string[];
  difficulty: string | null;
  marks: number;
  penalty: number;
  correctOptionId: string;
  value: string | null;
  firstValue: string | null;
  changes: number;
  timeMs: number;
  visits: number;
  marked: boolean;
};

export type Quality =
  | "fast-correct"
  | "slow-correct"
  | "rushed-wrong"
  | "struggled-wrong"
  | "time-sink-skip"
  | "skipped"
  | "not-reached";

export const QUALITY_LABEL: Record<Quality, string> = {
  "fast-correct": "Correct, on pace",
  "slow-correct": "Correct, but slow",
  "rushed-wrong": "Wrong, answered in a rush",
  "struggled-wrong": "Wrong after real effort",
  "time-sink-skip": "Skipped after a long time",
  skipped: "Skipped quickly",
  "not-reached": "Never opened",
};

type Tally = { total: number; correct: number; wrong: number; unanswered: number; timeMs: number; marksLost: number };
const tally = (): Tally => ({ total: 0, correct: 0, wrong: 0, unanswered: 0, timeMs: 0, marksLost: 0 });

export type Insight = { title: string; detail: string; impact: number };

export function analyseAttempt(questions: AnalysisQuestion[], durationSeconds: number) {
  const targetMs = (durationSeconds * 1000) / Math.max(1, questions.length);
  const rushedMs = Math.min(targetMs * 0.4, 30_000);

  const graded = questions.map((q) => {
    const answered = q.value !== null;
    const correct = answered && q.value === q.correctOptionId;
    let quality: Quality;
    if (correct) quality = q.timeMs <= targetMs ? "fast-correct" : "slow-correct";
    else if (answered) quality = q.timeMs < rushedMs ? "rushed-wrong" : "struggled-wrong";
    else if (q.visits === 0 && q.timeMs === 0) quality = "not-reached";
    else quality = q.timeMs > targetMs ? "time-sink-skip" : "skipped";
    const points = !answered ? 0 : correct ? q.marks : -q.penalty;
    // Marks lost relative to answering correctly.
    const lost = q.marks - points;
    return { ...q, answered, correct, quality, points, lost };
  });

  const qualities = Object.fromEntries(
    (Object.keys(QUALITY_LABEL) as Quality[]).map((k) => [k, graded.filter((g) => g.quality === k).length]),
  ) as Record<Quality, number>;

  const usedMs = graded.reduce((n, g) => n + g.timeMs, 0);
  const timeOn = (pred: (g: (typeof graded)[number]) => boolean) => {
    const set = graded.filter(pred);
    const ms = set.reduce((n, g) => n + g.timeMs, 0);
    return { count: set.length, totalMs: ms, avgMs: set.length ? Math.round(ms / set.length) : 0 };
  };
  const time = {
    targetMs: Math.round(targetMs),
    durationMs: durationSeconds * 1000,
    usedMs,
    correct: timeOn((g) => g.correct),
    wrong: timeOn((g) => g.answered && !g.correct),
    unanswered: timeOn((g) => !g.answered),
    perQuestion: graded.map((g) => ({ number: g.number, sectionName: g.sectionName, timeMs: g.timeMs, quality: g.quality })),
  };

  const group = (key: (g: (typeof graded)[number]) => string[]) => {
    const map = new Map<string, Tally>();
    for (const g of graded)
      for (const k of key(g)) {
        const t = map.get(k) ?? tally();
        t.total++;
        t.timeMs += g.timeMs;
        // A question the student never opened says nothing about the topic, so it costs the topic nothing.
        if (g.quality !== "not-reached") t.marksLost += g.lost;
        if (g.correct) t.correct++;
        else if (g.answered) t.wrong++;
        else t.unanswered++;
        map.set(k, t);
      }
    return [...map].map(([name, t]) => ({
      name,
      ...t,
      accuracy: t.correct + t.wrong ? Math.round((t.correct / (t.correct + t.wrong)) * 100) : null,
      avgMs: t.total ? Math.round(t.timeMs / t.total) : 0,
    }));
  };
  const topics = group((g) => (g.topics.length ? g.topics : ["General"])).sort((a, b) => b.marksLost - a.marksLost);
  const DIFFICULTY_ORDER = ["easy", "moderate", "hard"];
  const difficulty = group((g) => (g.difficulty ? [g.difficulty] : [])).sort(
    (a, b) => DIFFICULTY_ORDER.indexOf(a.name) - DIFFICULTY_ORDER.indexOf(b.name),
  );
  const sections = group((g) => [g.sectionName]).map((s) => ({
    ...s,
    idealMs: Math.round(targetMs * s.total),
  }));

  // Answer changes: did second thoughts help?
  const changed = graded.filter((g) => g.changes > 0 && g.firstValue !== null);
  const changes = {
    total: changed.length,
    wrongToRight: changed.filter((g) => g.firstValue !== g.correctOptionId && g.correct).length,
    rightToWrong: changed.filter((g) => g.firstValue === g.correctOptionId && !g.correct).length,
    wrongToWrong: changed.filter((g) => g.firstValue !== g.correctOptionId && !g.correct).length,
  };

  const markedQs = graded.filter((g) => g.marked);
  const review = {
    marked: markedQs.length,
    markedCorrect: markedQs.filter((g) => g.correct).length,
    markedUnanswered: markedQs.filter((g) => !g.answered).length,
  };

  const timeSinks = graded
    .filter((g) => !g.correct && g.timeMs > targetMs * 1.5)
    .sort((a, b) => b.timeMs - a.timeMs)
    .slice(0, 5)
    .map((g) => ({ number: g.number, sectionName: g.sectionName, timeMs: g.timeMs, quality: g.quality, topics: g.topics }));

  // Marks that were within reach without new knowledge.
  const rushed = graded.filter((g) => g.quality === "rushed-wrong");
  const recoverable = {
    rushedPenalty: rushed.reduce((n, g) => n + g.penalty, 0),
    changedAwayFromRight: graded
      .filter((g) => g.changes > 0 && g.firstValue === g.correctOptionId && !g.correct)
      .reduce((n, g) => n + g.marks + (g.answered ? g.penalty : 0), 0),
  };

  const insights = buildInsights({ graded, qualities, time, changes, review, timeSinks, recoverable, topics, difficulty, targetMs });

  return {
    questions: graded.map((g) => ({ number: g.number, sectionName: g.sectionName, quality: g.quality, timeMs: g.timeMs, correct: g.correct, answered: g.answered })),
    qualities,
    time,
    topics,
    difficulty,
    sections,
    changes,
    review,
    timeSinks,
    recoverable,
    insights,
  };
}

export type AttemptAnalysis = ReturnType<typeof analyseAttempt>;

const sec = (ms: number) => Math.round(ms / 1000);

function buildInsights(a: {
  graded: { quality: Quality; penalty: number; marks: number; answered: boolean }[];
  qualities: Record<Quality, number>;
  time: { usedMs: number; durationMs: number; correct: { avgMs: number }; wrong: { avgMs: number } };
  changes: { total: number; wrongToRight: number; rightToWrong: number };
  review: { marked: number; markedUnanswered: number };
  timeSinks: { number: number; sectionName: string; timeMs: number }[];
  recoverable: { rushedPenalty: number; changedAwayFromRight: number };
  topics: { name: string; marksLost: number; accuracy: number | null }[];
  difficulty: { name: string; accuracy: number | null; total: number }[];
  targetMs: number;
}): Insight[] {
  const out: Insight[] = [];
  const penaltyExam = a.graded.some((g) => g.penalty > 0);

  if (a.qualities["rushed-wrong"] >= 2)
    out.push({
      title: `${a.qualities["rushed-wrong"]} answers were rushed and wrong`,
      detail: `You spent under ${sec(Math.min(a.targetMs * 0.4, 30_000))} seconds on them.${penaltyExam ? ` They cost ${a.recoverable.rushedPenalty} negative marks.` : ""} Read the full question and all options before answering.`,
      impact: a.recoverable.rushedPenalty + a.qualities["rushed-wrong"],
    });

  const weakTopic = a.topics.find((t) => t.marksLost > 0);
  if (weakTopic)
    out.push({
      title: `${weakTopic.name} cost you the most: ${weakTopic.marksLost} marks`,
      detail: `Accuracy there was ${weakTopic.accuracy ?? 0}%. Revise it before your next test.`,
      impact: weakTopic.marksLost,
    });

  if (a.timeSinks.length)
    out.push({
      title: `${a.timeSinks.length} question${a.timeSinks.length > 1 ? "s" : ""} took over 1.5× the ideal time without a correct answer`,
      detail: `The longest was ${a.timeSinks[0].sectionName} Q${a.timeSinks[0].number} (${sec(a.timeSinks[0].timeMs)} s). Set a limit: mark it for review and move on, then return with the time left.`,
      impact: a.timeSinks.reduce((n, t) => n + t.timeMs, 0) / a.targetMs,
    });

  if (a.changes.rightToWrong > a.changes.wrongToRight && a.changes.rightToWrong > 0)
    out.push({
      title: `Changing answers cost you: ${a.changes.rightToWrong} right answer${a.changes.rightToWrong > 1 ? "s" : ""} changed to wrong`,
      detail: `Only ${a.changes.wrongToRight} change${a.changes.wrongToRight === 1 ? "" : "s"} went the other way. Change an answer only when you find a concrete error, not on a hunch.`,
      impact: a.recoverable.changedAwayFromRight,
    });
  else if (a.changes.wrongToRight > 0)
    out.push({
      title: `Your second looks paid off: ${a.changes.wrongToRight} wrong answer${a.changes.wrongToRight > 1 ? "s" : ""} corrected`,
      detail: "Keep reserving time at the end to review marked questions.",
      impact: a.changes.wrongToRight,
    });

  const unanswered = a.qualities.skipped + a.qualities["time-sink-skip"] + a.qualities["not-reached"];
  if (!penaltyExam && unanswered > 0)
    out.push({
      title: `${unanswered} question${unanswered > 1 ? "s" : ""} left blank with no negative marking`,
      detail: "A blank and a wrong answer both score zero here, so always answer every question before time runs out.",
      impact: unanswered * 2,
    });
  if (a.qualities["not-reached"] >= 3)
    out.push({
      title: `You never reached ${a.qualities["not-reached"]} questions`,
      detail: "Do a quick first pass through the whole paper, answering what you know, before spending time on hard questions.",
      impact: a.qualities["not-reached"],
    });

  if (a.time.wrong.avgMs > a.time.correct.avgMs * 1.4 && a.time.wrong.avgMs > a.targetMs)
    out.push({
      title: "Long struggles rarely ended in a right answer",
      detail: `Your wrong answers took ${sec(a.time.wrong.avgMs)} s on average versus ${sec(a.time.correct.avgMs)} s for correct ones. If a question isn't opening up after a minute, move on.`,
      impact: 2,
    });

  if (a.review.markedUnanswered > 0)
    out.push({
      title: `${a.review.markedUnanswered} marked question${a.review.markedUnanswered > 1 ? "s were" : " was"} never answered`,
      detail: "Leave the last 5–10 minutes to return to questions marked for review.",
      impact: a.review.markedUnanswered,
    });

  const hard = a.difficulty.find((d) => d.name === "hard");
  const easy = a.difficulty.find((d) => d.name === "easy");
  if (easy && easy.accuracy !== null && easy.accuracy < 80 && easy.total >= 3)
    out.push({
      title: `Easy questions are leaking marks (${easy.accuracy}% accuracy)`,
      detail: "These should be your banker marks. Slow down slightly on straightforward questions.",
      impact: 3,
    });
  else if (hard && hard.accuracy !== null && hard.accuracy >= 70 && hard.total >= 3)
    out.push({ title: `Strong on hard questions (${hard.accuracy}% accuracy)`, detail: "Your concepts are solid; focus on speed and accuracy in the rest.", impact: 1 });

  if (a.time.usedMs < a.time.durationMs * 0.6 && a.qualities["rushed-wrong"] > 0)
    out.push({
      title: `You finished with ${Math.round((a.time.durationMs - a.time.usedMs) / 60000)} minutes unused`,
      detail: "Use spare time to re-check answers you made quickly.",
      impact: 1,
    });

  return out.sort((x, y) => y.impact - x.impact).slice(0, 6);
}

/** Aggregates several attempts into a student's overall picture. */
export function analyseOverall(
  attempts: { attemptId: string; title: string; exam: string | null; subject: string | null; date: string; score: number; maxScore: number; analysis: AttemptAnalysis }[],
) {
  const ordered = [...attempts].sort((a, b) => a.date.localeCompare(b.date));
  const trend = ordered.map((a) => ({
    attemptId: a.attemptId,
    title: a.title,
    date: a.date,
    percent: Math.round((a.score / a.maxScore) * 100),
    score: a.score,
    maxScore: a.maxScore,
    rushedWrong: a.analysis.qualities["rushed-wrong"],
    avgSecPerQuestion: Math.round(a.analysis.time.usedMs / Math.max(1, a.analysis.questions.length) / 1000),
  }));

  const topicMap = new Map<string, { name: string; subject: string; total: number; correct: number; wrong: number; marksLost: number; timeMs: number }>();
  for (const a of ordered)
    for (const t of a.analysis.topics) {
      const key = `${a.subject ?? a.exam}:${t.name}`;
      const m = topicMap.get(key) ?? { name: t.name, subject: a.subject ?? a.exam ?? "", total: 0, correct: 0, wrong: 0, marksLost: 0, timeMs: 0 };
      m.total += t.total;
      m.correct += t.correct;
      m.wrong += t.wrong;
      m.marksLost += t.marksLost;
      m.timeMs += t.timeMs;
      topicMap.set(key, m);
    }
  const topics = [...topicMap.values()].map((t) => ({
    ...t,
    accuracy: t.correct + t.wrong ? Math.round((t.correct / (t.correct + t.wrong)) * 100) : null,
    avgSec: t.total ? Math.round(t.timeMs / t.total / 1000) : 0,
  }));
  const mastered = topics
    .filter((t) => t.correct + t.wrong >= 4 && (t.accuracy ?? 0) >= 80)
    .sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0));
  const focus = topics
    .filter((t) => t.marksLost > 0 && !mastered.includes(t))
    .sort((a, b) => b.marksLost - a.marksLost)
    .slice(0, 8);

  const subjectMap = new Map<string, { subject: string; attempts: number; bestPercent: number; lastPercent: number }>();
  for (const t of trend) {
    const a = ordered.find((o) => o.attemptId === t.attemptId)!;
    const key = a.subject ?? a.exam ?? "Other";
    const s = subjectMap.get(key) ?? { subject: key, attempts: 0, bestPercent: 0, lastPercent: 0 };
    s.attempts++;
    s.bestPercent = Math.max(s.bestPercent, t.percent);
    s.lastPercent = t.percent;
    subjectMap.set(key, s);
  }

  const totals = ordered.reduce(
    (acc, a) => {
      acc.questions += a.analysis.questions.length;
      acc.rushedWrong += a.analysis.qualities["rushed-wrong"];
      acc.rightToWrong += a.analysis.changes.rightToWrong;
      acc.wrongToRight += a.analysis.changes.wrongToRight;
      acc.timeSinks += a.analysis.timeSinks.length;
      return acc;
    },
    { questions: 0, rushedWrong: 0, rightToWrong: 0, wrongToRight: 0, timeSinks: 0 },
  );

  const first = trend[0];
  const last = trend.at(-1);
  const plan: string[] = [];
  if (focus[0]) plan.push(`Revise ${focus.slice(0, 3).map((t) => t.name).join(", ")} — they have cost you the most marks so far.`);
  if (totals.rushedWrong >= 3) plan.push(`Slow down on first reads: ${totals.rushedWrong} rushed answers were wrong across your tests.`);
  if (totals.rightToWrong > totals.wrongToRight) plan.push("Trust your first answer unless you find a specific mistake — changes have cost you more than they gained.");
  if (totals.timeSinks >= 3) plan.push("Use a one-minute rule: mark long questions for review and come back at the end.");
  if (trend.length < 3) plan.push("Take at least three full tests so your topic picture becomes reliable.");

  return {
    attempts: trend.length,
    trend,
    change: first && last && trend.length > 1 ? last.percent - first.percent : null,
    subjects: [...subjectMap.values()],
    mastered: mastered.slice(0, 8),
    focus,
    totals,
    plan,
  };
}
