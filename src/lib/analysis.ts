// Post-test analysis built from outcomes plus behaviour: time on each question, visits, answer changes
// and review marks. Pure functions so the same logic serves the results page, the overall analysis
// page and tests. Nothing here compares a student with other students: there is no cohort data.

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

export type Quality = "fast-correct" | "slow-correct" | "rushed-wrong" | "struggled-wrong" | "time-sink-skip" | "skipped" | "not-reached";

export const QUALITY_LABEL: Record<Quality, string> = {
  "fast-correct": "Correct, on pace",
  "slow-correct": "Correct, but slow",
  "rushed-wrong": "Wrong, answered in a rush",
  "struggled-wrong": "Wrong after real effort",
  "time-sink-skip": "Skipped after a long time",
  skipped: "Skipped quickly",
  "not-reached": "Never opened",
};

/** The four outcomes a mark can have. "blank" was opened but not answered. */
export type Outcome = "correct" | "wrong" | "blank" | "not-reached";
export const OUTCOME_LABEL: Record<Outcome, string> = {
  correct: "Correct",
  wrong: "Wrong",
  blank: "Left blank",
  "not-reached": "Never opened",
};

/** What a change of answer did: compares the first option chosen with the final answer. */
export type ChangeKind = "wrong-to-right" | "right-to-wrong" | "wrong-to-wrong" | "right-to-right";

/** Where in the results the evidence for an insight lives. */
export type InsightTab = "summary" | "time" | "topics" | "decisions" | "questions";
export type Insight = { title: string; detail: string; impact: number; tab: InsightTab; tone: "fix" | "keep" };

type Tally = { total: number; correct: number; wrong: number; unanswered: number; notReached: number; timeMs: number; marksLost: number };
const tally = (): Tally => ({ total: 0, correct: 0, wrong: 0, unanswered: 0, notReached: 0, timeMs: 0, marksLost: 0 });
const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

export type AnalyseOptions = {
  /** NEST-style best-of-N sections. The pace and maximum then assume N sections are attempted. */
  bestSections?: number | null;
};

export function analyseAttempt(questions: AnalysisQuestion[], durationSeconds: number, options: AnalyseOptions = {}) {
  const sectionIds = [...new Set(questions.map((q) => q.sectionId))];
  const best = options.bestSections && options.bestSections < sectionIds.length ? options.bestSections : null;
  // With best-of-N the student needs to attempt only N sections, so the ideal pace spreads the time over those.
  const paceCount = best ? Math.round((questions.length * best) / sectionIds.length) : questions.length;
  const targetMs = (durationSeconds * 1000) / Math.max(1, paceCount);
  const rushedMs = Math.min(targetMs * 0.4, 30_000);

  const graded = questions.map((q, index) => {
    const answered = q.value !== null;
    const correct = answered && q.value === q.correctOptionId;
    let quality: Quality;
    if (correct) quality = q.timeMs <= targetMs ? "fast-correct" : "slow-correct";
    else if (answered) quality = q.timeMs < rushedMs ? "rushed-wrong" : "struggled-wrong";
    else if (q.visits === 0 && q.timeMs === 0) quality = "not-reached";
    else quality = q.timeMs > targetMs ? "time-sink-skip" : "skipped";
    const outcome: Outcome = correct ? "correct" : answered ? "wrong" : quality === "not-reached" ? "not-reached" : "blank";
    const pointsFor = (v: string | null) => (v === null ? 0 : v === q.correctOptionId ? q.marks : -q.penalty);
    const points = pointsFor(q.value);
    // Marks lost relative to answering correctly.
    const lost = q.marks - points;
    let changeKind: ChangeKind | null = null;
    if (q.changes > 0 && q.firstValue !== null) {
      const firstRight = q.firstValue === q.correctOptionId;
      changeKind = firstRight ? (correct ? "right-to-right" : "right-to-wrong") : correct ? "wrong-to-right" : "wrong-to-wrong";
    }
    const changeDelta = changeKind ? points - pointsFor(q.firstValue) : 0;
    return { ...q, index, answered, correct, quality, outcome, points, lost, changeKind, changeDelta };
  });
  type Graded = (typeof graded)[number];

  const qualities = Object.fromEntries(
    (Object.keys(QUALITY_LABEL) as Quality[]).map((k) => [k, graded.filter((g) => g.quality === k).length]),
  ) as Record<Quality, number>;

  const usedMs = graded.reduce((n, g) => n + g.timeMs, 0);
  const recorded = usedMs > 0;
  const timeOn = (pred: (g: Graded) => boolean) => {
    const set = graded.filter(pred);
    const ms = set.reduce((n, g) => n + g.timeMs, 0);
    return { count: set.length, totalMs: ms, avgMs: set.length ? Math.round(ms / set.length) : 0 };
  };

  // Distribution of time over the questions the student actually spent time on.
  const timed = graded.filter((g) => g.timeMs > 0).sort((a, b) => a.timeMs - b.timeMs);
  const quantile = (p: number) => (timed.length ? timed[Math.min(timed.length - 1, Math.max(0, Math.ceil(p * timed.length) - 1))].timeMs : 0);
  const slowestCount = Math.ceil(timed.length * 0.1);
  const slowest = timed.slice(timed.length - slowestCount).reverse();
  const slowestMs = slowest.reduce((n, g) => n + g.timeMs, 0);
  const edges = [0, rushedMs, targetMs, targetMs * 1.5, targetMs * 2, Infinity];
  const buckets = edges.slice(0, -1).map((from, i) => {
    const inBucket = timed.filter((g) => g.timeMs >= from && g.timeMs < edges[i + 1]);
    return {
      fromMs: Math.round(from),
      toMs: Number.isFinite(edges[i + 1]) ? Math.round(edges[i + 1]) : null,
      correct: inBucket.filter((g) => g.outcome === "correct").length,
      wrong: inBucket.filter((g) => g.outcome === "wrong").length,
      blank: inBucket.filter((g) => g.outcome === "blank").length,
    };
  });

  const time = {
    recorded,
    targetMs: Math.round(targetMs),
    rushedMs: Math.round(rushedMs),
    durationMs: durationSeconds * 1000,
    usedMs,
    correct: timeOn((g) => g.correct),
    wrong: timeOn((g) => g.answered && !g.correct),
    unanswered: timeOn((g) => !g.answered),
    medianMs: quantile(0.5),
    p90Ms: quantile(0.9),
    slowest: {
      count: slowest.length,
      totalMs: slowestMs,
      share: pct(slowestMs, usedMs),
      correct: slowest.filter((g) => g.correct).length,
      indexes: slowest.map((g) => g.index),
    },
    buckets,
    perQuestion: graded.map((g) => ({ number: g.number, sectionName: g.sectionName, timeMs: g.timeMs, quality: g.quality })),
  };

  // Cumulative time in paper order against the ideal pace. Students jump around, so this shows how the
  // time was spread across the paper, not the order it was spent in.
  let cum = 0;
  const pacePoints = graded.map((g) => {
    cum += g.timeMs;
    return { index: g.index, cumMs: cum, idealMs: Math.round(targetMs * (g.index + 1)) };
  });
  const extreme = (sign: 1 | -1) => {
    let found: { index: number; ms: number } | null = null;
    for (const p of pacePoints) {
      const d = (p.cumMs - p.idealMs) * sign;
      if (d > 0 && (!found || d > found.ms)) found = { index: p.index, ms: Math.round(d) };
    }
    return found;
  };
  const pace = {
    points: pacePoints,
    maxBehind: recorded ? extreme(1) : null,
    maxAhead: recorded ? extreme(-1) : null,
    sectionStarts: sectionIds.map((id) => {
      const first = graded.find((g) => g.sectionId === id)!;
      return { index: first.index, name: first.sectionName };
    }),
  };

  const quadrants = {
    fastRight: graded.filter((g) => g.correct && g.timeMs > 0 && g.timeMs <= targetMs).length,
    slowRight: graded.filter((g) => g.correct && g.timeMs > targetMs).length,
    fastWrong: graded.filter((g) => g.outcome === "wrong" && g.timeMs > 0 && g.timeMs <= targetMs).length,
    slowWrong: graded.filter((g) => g.outcome === "wrong" && g.timeMs > targetMs).length,
  };

  const group = (key: (g: Graded) => string[]) => {
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
        else {
          t.unanswered++;
          if (g.outcome === "not-reached") t.notReached++;
        }
        map.set(k, t);
      }
    return [...map].map(([name, t]) => ({
      name,
      ...t,
      accuracy: t.correct + t.wrong ? Math.round((t.correct / (t.correct + t.wrong)) * 100) : null,
      avgMs: t.total ? Math.round(t.timeMs / t.total) : 0,
    }));
  };
  // The first topic is the chapter; later entries describe the single question, so they would only
  // repeat each question as its own "topic".
  const topics = group((g) => [g.topics[0] ?? "General"]).sort((a, b) => b.marksLost - a.marksLost || b.total - a.total);
  const DIFFICULTY_ORDER = ["easy", "moderate", "hard"];
  const difficulty = group((g) => (g.difficulty ? [g.difficulty] : [])).sort(
    (a, b) => DIFFICULTY_ORDER.indexOf(a.name) - DIFFICULTY_ORDER.indexOf(b.name),
  );

  // Section scores, and which sections count under best-of-N (same rule as the official scoring:
  // highest scores win, ties keep paper order).
  const sectionScore = new Map(sectionIds.map((id) => [id, { score: 0, maxScore: 0 }]));
  for (const g of graded) {
    const s = sectionScore.get(g.sectionId)!;
    s.score += g.points;
    s.maxScore += g.marks;
  }
  const counted = new Set(best ? [...sectionIds].sort((a, b) => sectionScore.get(b)!.score - sectionScore.get(a)!.score).slice(0, best) : sectionIds);
  const sectionNames = group((g) => [g.sectionId]);
  const sections = sectionIds.map((id) => {
    const t = sectionNames.find((s) => s.name === id)!;
    const sectionTotal = t.total;
    return {
      ...t,
      id,
      name: graded.find((g) => g.sectionId === id)!.sectionName,
      ...sectionScore.get(id)!,
      counted: counted.has(id),
      attempted: t.correct + t.wrong,
      idealMs: Math.round(targetMs * sectionTotal),
    };
  });

  // The score story: from the maximum down to the actual score, over the sections that count.
  const inScore = graded.filter((g) => counted.has(g.sectionId));
  const sum = (list: Graded[], f: (g: Graded) => number) => list.reduce((n, g) => n + f(g), 0);
  const attemptedAll = graded.filter((g) => g.answered).length;
  const correctAll = graded.filter((g) => g.correct).length;
  const score = {
    max: sum(inScore, (g) => g.marks),
    gained: sum(
      inScore.filter((g) => g.correct),
      (g) => g.marks,
    ),
    blankMarks: sum(
      inScore.filter((g) => !g.answered),
      (g) => g.marks,
    ),
    wrongMarks: sum(
      inScore.filter((g) => g.outcome === "wrong"),
      (g) => g.marks,
    ),
    penalty: sum(
      inScore.filter((g) => g.outcome === "wrong"),
      (g) => g.penalty,
    ),
    score: sum(inScore, (g) => g.points),
    total: graded.length,
    attempted: attemptedAll,
    correct: correctAll,
    wrong: attemptedAll - correctAll,
    blank: graded.filter((g) => g.outcome === "blank").length,
    notReached: qualities["not-reached"],
    attemptRate: pct(attemptedAll, graded.length),
    accuracy: pct(correctAll, attemptedAll),
    penaltyExam: graded.some((g) => g.penalty > 0),
    notCounted: sections.filter((s) => !s.counted).map((s) => s.name),
  };

  // Answer changes: did second thoughts help? Net effect compares each final answer with the first one.
  const changed = graded.filter((g) => g.changeKind);
  const changes = {
    total: changed.length,
    wrongToRight: changed.filter((g) => g.changeKind === "wrong-to-right").length,
    rightToWrong: changed.filter((g) => g.changeKind === "right-to-wrong").length,
    wrongToWrong: changed.filter((g) => g.changeKind === "wrong-to-wrong").length,
    rightToRight: changed.filter((g) => g.changeKind === "right-to-right").length,
    gained: sum(
      changed.filter((g) => g.changeDelta > 0),
      (g) => g.changeDelta,
    ),
    lost: -sum(
      changed.filter((g) => g.changeDelta < 0),
      (g) => g.changeDelta,
    ),
    net: sum(changed, (g) => g.changeDelta),
  };

  const markedQs = graded.filter((g) => g.marked);
  const review = {
    marked: markedQs.length,
    markedCorrect: markedQs.filter((g) => g.correct).length,
    markedWrong: markedQs.filter((g) => g.outcome === "wrong").length,
    markedUnanswered: markedQs.filter((g) => !g.answered).length,
    // Opened again after the first visit: the student actually came back to it.
    revisited: markedQs.filter((g) => g.visits > 1).length,
  };

  // Fast answers (under the rushed threshold) are likely guesses or careless reads. Their net effect on the
  // score shows whether guessing paid off under this marking scheme.
  const fast = graded.filter((g) => g.answered && g.timeMs > 0 && g.timeMs < rushedMs);
  const guesses = {
    thresholdMs: Math.round(rushedMs),
    count: fast.length,
    correct: fast.filter((g) => g.correct).length,
    wrong: fast.filter((g) => !g.correct).length,
    net: sum(fast, (g) => g.points),
    penaltyExam: score.penaltyExam,
  };

  const timeSinks = graded
    .filter((g) => !g.correct && g.timeMs > targetMs * 1.5)
    .sort((a, b) => b.timeMs - a.timeMs)
    .slice(0, 5)
    .map((g) => ({ index: g.index, number: g.number, sectionName: g.sectionName, timeMs: g.timeMs, quality: g.quality, topics: g.topics }));

  // Marks that were within reach without new knowledge.
  const rushed = graded.filter((g) => g.quality === "rushed-wrong");
  const recoverable = {
    rushedPenalty: rushed.reduce((n, g) => n + g.penalty, 0),
    changedAwayFromRight: graded
      .filter((g) => g.changes > 0 && g.firstValue === g.correctOptionId && !g.correct)
      .reduce((n, g) => n + g.marks + (g.answered ? g.penalty : 0), 0),
  };

  const insights = buildInsights({
    graded,
    qualities,
    time,
    changes,
    review,
    timeSinks,
    recoverable,
    topics,
    difficulty,
    targetMs,
    pace,
    guesses,
    score,
  });

  return {
    questions: graded.map((g) => ({
      index: g.index,
      number: g.number,
      sectionName: g.sectionName,
      topics: g.topics,
      difficulty: g.difficulty,
      quality: g.quality,
      outcome: g.outcome,
      timeMs: g.timeMs,
      visits: g.visits,
      correct: g.correct,
      answered: g.answered,
      marked: g.marked,
      points: g.points,
      marks: g.marks,
      penalty: g.penalty,
      value: g.value,
      firstValue: g.firstValue,
      changes: g.changes,
      changeKind: g.changeKind,
      changeDelta: g.changeDelta,
    })),
    qualities,
    score,
    time,
    pace,
    quadrants,
    topics,
    difficulty,
    sections,
    changes,
    review,
    guesses,
    timeSinks,
    recoverable,
    insights,
  };
}

export type AttemptAnalysis = ReturnType<typeof analyseAttempt>;

const sec = (ms: number) => Math.round(ms / 1000);
const mins = (ms: number) => {
  const m = ms / 60000;
  return m >= 10 ? `${Math.round(m)} min` : `${Math.round(m * 10) / 10} min`;
};
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function buildInsights(a: {
  graded: { quality: Quality; penalty: number; marks: number; answered: boolean; index: number; number: number; sectionName: string }[];
  qualities: Record<Quality, number>;
  time: AttemptAnalysis["time"];
  changes: AttemptAnalysis["changes"];
  review: AttemptAnalysis["review"];
  timeSinks: AttemptAnalysis["timeSinks"];
  recoverable: AttemptAnalysis["recoverable"];
  topics: AttemptAnalysis["topics"];
  difficulty: AttemptAnalysis["difficulty"];
  targetMs: number;
  pace: AttemptAnalysis["pace"];
  guesses: AttemptAnalysis["guesses"];
  score: AttemptAnalysis["score"];
}): Insight[] {
  const out: Insight[] = [];
  const penaltyExam = a.score.penaltyExam;
  const label = (index: number) => {
    const g = a.graded[index];
    const multi = new Set(a.graded.map((x) => x.sectionName)).size > 1;
    return `${multi ? `${g.sectionName} ` : ""}Q${g.number}`;
  };
  const avgMarks = a.graded.length ? a.graded.reduce((n, g) => n + g.marks, 0) / a.graded.length : 0;
  const avgPenalty = a.graded.length ? a.graded.reduce((n, g) => n + g.penalty, 0) / a.graded.length : 0;
  // Expected marks per extra question attempted at the student's own accuracy (never below zero).
  const acc = a.score.attempted ? a.score.correct / a.score.attempted : 0;
  const expectedPerQ = Math.max(0, acc * avgMarks - (1 - acc) * avgPenalty);

  if (a.qualities["rushed-wrong"] >= 2)
    out.push({
      title: `${a.qualities["rushed-wrong"]} answers were rushed and wrong`,
      detail: `You spent under ${sec(a.time.rushedMs)} seconds on each.${penaltyExam ? ` They cost ${a.recoverable.rushedPenalty} negative marks.` : ""} Read the full question and every option before you click.`,
      impact: a.recoverable.rushedPenalty + a.qualities["rushed-wrong"],
      tab: "time",
      tone: "fix",
    });

  // Guessing: when fast answers lost marks overall, skipping them would have scored more.
  if (penaltyExam && a.guesses.count >= 3 && a.guesses.net < 0)
    out.push({
      title: `Quick answers cost you ${-a.guesses.net} marks overall`,
      detail: `${a.guesses.count} answers took under ${sec(a.guesses.thresholdMs)} s; ${a.guesses.wrong} were wrong. Skipping them would have scored ${-a.guesses.net} more. Answer fast only when you are sure.`,
      impact: -a.guesses.net,
      tab: "decisions",
      tone: "fix",
    });

  const weakTopic = a.topics.find((t) => t.marksLost > 0);
  if (weakTopic)
    out.push({
      title: `${weakTopic.name} cost you the most: ${weakTopic.marksLost} marks`,
      detail: `${weakTopic.correct} of ${weakTopic.total} right${weakTopic.accuracy !== null ? ` (${weakTopic.accuracy}% of those you answered)` : ""}. Revise it and redo its questions in the review list before your next test.`,
      impact: weakTopic.marksLost * 0.8,
      tab: "topics",
      tone: "fix",
    });

  // Fell behind the ideal pace and never reached the end of the paper.
  const notReached = a.qualities["not-reached"];
  if (a.pace.maxBehind && notReached >= 2)
    out.push({
      title: `You never opened ${plural(notReached, "question")}`,
      detail: `By ${label(a.pace.maxBehind.index)} your time on the paper so far was ${mins(a.pace.maxBehind.ms)} over the ideal pace. At your accuracy, those questions were worth about ${Math.round(notReached * expectedPerQ)} marks. Do a quick first pass of the whole paper before digging into hard ones.`,
      impact: notReached * expectedPerQ,
      tab: "time",
      tone: "fix",
    });
  else if (notReached >= 3)
    out.push({
      title: `You never opened ${plural(notReached, "question")}`,
      detail: "Do a quick first pass through the whole paper, answering what you know, before spending time on hard questions.",
      impact: notReached * expectedPerQ,
      tab: "time",
      tone: "fix",
    });

  if (a.timeSinks.length)
    out.push({
      title: `${plural(a.timeSinks.length, "question")} took over 1.5× the ideal time with no mark`,
      detail: `The longest was ${label(a.timeSinks[0].index)} (${sec(a.timeSinks[0].timeMs)} s against an ideal ${sec(a.targetMs)} s). After one ideal-time's worth of work, mark it for review and move on.`,
      impact: (a.timeSinks.reduce((n, t) => n + t.timeMs, 0) / a.targetMs) * expectedPerQ * 0.5,
      tab: "time",
      tone: "fix",
    });
  else if (a.time.slowest.count >= 3 && a.time.slowest.share >= 30)
    out.push({
      title: `Your ${a.time.slowest.count} slowest questions took ${a.time.slowest.share}% of your time`,
      detail: `They returned ${a.time.slowest.correct} correct. Cap any one question at about ${sec(a.targetMs * 1.5)} s on the first pass.`,
      impact: 1.5,
      tab: "time",
      tone: "fix",
    });

  if (a.changes.net < 0)
    out.push({
      title: `Changing answers cost you ${-a.changes.net} marks`,
      detail: `${plural(a.changes.rightToWrong, "right answer")} became wrong or blank; ${a.changes.wrongToRight} wrong went right. Change an answer only when you find a concrete error, not on a hunch.`,
      impact: -a.changes.net,
      tab: "decisions",
      tone: "fix",
    });
  else if (a.changes.net > 0)
    out.push({
      title: `Your second looks earned ${a.changes.net} marks`,
      detail: `${plural(a.changes.wrongToRight, "wrong answer")} corrected. Keep reserving time at the end to recheck marked questions.`,
      impact: Math.min(1, a.changes.net),
      tab: "decisions",
      tone: "keep",
    });

  const unanswered = a.qualities.skipped + a.qualities["time-sink-skip"] + notReached;
  if (!penaltyExam && unanswered > 0)
    out.push({
      title: `${plural(unanswered, "question")} left blank with no negative marking`,
      detail: "A blank and a wrong answer both score zero here, so always answer every question before time runs out.",
      impact: unanswered * avgMarks * 0.25,
      tab: "decisions",
      tone: "fix",
    });

  if (a.time.wrong.count >= 2 && a.time.wrong.avgMs > a.time.correct.avgMs * 1.4 && a.time.wrong.avgMs > a.targetMs)
    out.push({
      title: "Long struggles rarely ended in a right answer",
      detail: `Your wrong answers took ${sec(a.time.wrong.avgMs)} s on average against ${sec(a.time.correct.avgMs)} s for correct ones. If a question isn't opening up after ${sec(a.targetMs)} s, move on.`,
      impact: 2,
      tab: "time",
      tone: "fix",
    });

  if (a.review.markedUnanswered > 0)
    out.push({
      title: `${plural(a.review.markedUnanswered, "marked question")} never got an answer`,
      detail: "Leave the last 5–10 minutes to return to questions you marked for review.",
      impact: a.review.markedUnanswered * expectedPerQ,
      tab: "decisions",
      tone: "fix",
    });

  const hard = a.difficulty.find((d) => d.name === "hard");
  const easy = a.difficulty.find((d) => d.name === "easy");
  if (easy && easy.accuracy !== null && easy.accuracy < 80 && easy.total >= 3)
    out.push({
      title: `Easy questions are leaking marks (${easy.accuracy}% accuracy)`,
      detail: `${easy.wrong} easy question${easy.wrong === 1 ? " was" : "s were"} answered wrong. These should be your banker marks: slow down slightly on straightforward questions.`,
      impact: easy.marksLost * 0.6,
      tab: "topics",
      tone: "fix",
    });
  else if (hard && hard.accuracy !== null && hard.accuracy >= 70 && hard.total >= 3)
    out.push({
      title: `Strong on hard questions (${hard.accuracy}% accuracy)`,
      detail: "Your concepts are solid; spend your practice on speed and on the topics above.",
      impact: 0.5,
      tab: "topics",
      tone: "keep",
    });

  if (a.time.recorded && a.time.usedMs < a.time.durationMs * 0.6 && a.qualities["rushed-wrong"] > 0)
    out.push({
      title: `You finished with ${Math.round((a.time.durationMs - a.time.usedMs) / 60000)} minutes unused`,
      detail: "Spend spare time re-checking the answers you made quickly.",
      impact: 1,
      tab: "time",
      tone: "fix",
    });

  return out.sort((x, y) => y.impact - x.impact).slice(0, 5);
}

type OverallInput = {
  attemptId: string;
  title: string;
  exam: string | null;
  subject: string | null;
  date: string;
  score: number;
  maxScore: number;
  analysis: AttemptAnalysis;
};

/** Aggregates several attempts into a student's overall picture. */
export function analyseOverall(attempts: OverallInput[]) {
  const ordered = [...attempts].sort((a, b) => a.date.localeCompare(b.date));
  const trend = ordered.map((a) => {
    const an = a.analysis;
    const attempted = an.questions.filter((q) => q.answered);
    const attemptedMs = attempted.reduce((n, q) => n + q.timeMs, 0);
    const recorded = an.time.usedMs > 0;
    return {
      attemptId: a.attemptId,
      title: a.title,
      date: a.date,
      percent: Math.round((a.score / Math.max(1, a.maxScore)) * 100),
      score: a.score,
      maxScore: a.maxScore,
      accuracy: pct(an.questions.filter((q) => q.correct).length, attempted.length),
      attemptRate: pct(attempted.length, an.questions.length),
      rushedWrong: an.qualities["rushed-wrong"],
      notReached: an.qualities["not-reached"],
      timingRecorded: recorded,
      avgSecPerQuestion: Math.round(an.time.usedMs / Math.max(1, an.questions.length) / 1000),
      // Average time per answered question as a share of the ideal pace: 100 means exactly on pace.
      pacePercent: recorded && attempted.length ? Math.round((attemptedMs / attempted.length / Math.max(1, an.time.targetMs)) * 100) : null,
      timeUsedPercent: recorded ? pct(an.time.usedMs, an.time.durationMs) : null,
    };
  });

  const topicMap = new Map<
    string,
    {
      name: string;
      subject: string;
      total: number;
      correct: number;
      wrong: number;
      marksLost: number;
      timeMs: number;
      seen: { attemptId: string; accuracy: number | null; total: number; marksLost: number }[];
    }
  >();
  for (const a of ordered)
    for (const t of a.analysis.topics) {
      const key = `${a.subject ?? a.exam}:${t.name}`;
      const m = topicMap.get(key) ?? {
        name: t.name,
        subject: a.subject ?? a.exam ?? "",
        total: 0,
        correct: 0,
        wrong: 0,
        marksLost: 0,
        timeMs: 0,
        seen: [],
      };
      m.total += t.total;
      m.correct += t.correct;
      m.wrong += t.wrong;
      m.marksLost += t.marksLost;
      m.timeMs += t.timeMs;
      m.seen.push({ attemptId: a.attemptId, accuracy: t.accuracy, total: t.total, marksLost: t.marksLost });
      topicMap.set(key, m);
    }
  const topics = [...topicMap.values()].map((t) => ({
    ...t,
    accuracy: t.correct + t.wrong ? Math.round((t.correct / (t.correct + t.wrong)) * 100) : null,
    avgSec: t.total ? Math.round(t.timeMs / t.total / 1000) : 0,
  }));
  const mastered = topics.filter((t) => t.correct + t.wrong >= 4 && (t.accuracy ?? 0) >= 80).sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0));
  const focus = topics
    .filter((t) => t.marksLost > 0 && !mastered.includes(t))
    .sort((a, b) => b.marksLost - a.marksLost)
    .slice(0, 8);
  // Weak in every test that included the topic (at least two tests): a pattern, not a one-off.
  const persistent = topics
    .filter((t) => t.seen.length >= 2 && t.seen.every((s) => s.marksLost > 0 && (s.accuracy === null || s.accuracy < 60)))
    .sort((a, b) => b.marksLost - a.marksLost)
    .slice(0, 6)
    .map(({ name, subject, seen, marksLost, accuracy }) => ({ name, subject, tests: seen.length, marksLost, accuracy }));

  // Topic × test grid for the most-practised topics, most recent tests last.
  const gridTests = ordered.slice(-8);
  const gridTopics = [...topics]
    .filter((t) => t.seen.some((s) => gridTests.some((g) => g.attemptId === s.attemptId)))
    .sort((a, b) => b.total - a.total || b.marksLost - a.marksLost)
    .slice(0, 12);
  const topicGrid = {
    tests: gridTests.map((t) => ({ attemptId: t.attemptId, title: t.title, date: t.date })),
    rows: gridTopics.map((t) => ({
      name: t.name,
      subject: t.subject,
      cells: gridTests.map((g) => {
        const s = t.seen.find((x) => x.attemptId === g.attemptId);
        return s ? { accuracy: s.accuracy, total: s.total } : null;
      }),
    })),
  };

  const subjectMap = new Map<string, { subject: string; attempts: number; bestPercent: number; lastPercent: number }>();
  for (const t of trend) {
    const a = ordered.find((o) => o.attemptId === t.attemptId)!;
    const key = a.subject ?? a.exam ?? "Other";
    const s = subjectMap.get(key) ?? { subject: key, attempts: 0, bestPercent: -Infinity, lastPercent: 0 };
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
      acc.changeNet += a.analysis.changes.net ?? 0;
      acc.timeSinks += a.analysis.timeSinks.length;
      acc.notReached += a.analysis.qualities["not-reached"];
      return acc;
    },
    { questions: 0, rushedWrong: 0, rightToWrong: 0, wrongToRight: 0, changeNet: 0, timeSinks: 0, notReached: 0 },
  );

  const first = trend[0];
  const last = trend.at(-1);
  const plan: string[] = [];
  if (persistent[0])
    plan.push(
      `${persistent
        .slice(0, 3)
        .map((t) => t.name)
        .join(
          ", ",
        )} ${persistent.length === 1 ? "has" : "have"} lost marks in every test that included ${persistent.length === 1 ? "it" : "them"}. Start revision there.`,
    );
  else if (focus[0])
    plan.push(
      `Revise ${focus
        .slice(0, 3)
        .map((t) => t.name)
        .join(", ")}: they have cost you the most marks so far.`,
    );
  if (totals.rushedWrong >= 3) plan.push(`Slow down on first reads: ${totals.rushedWrong} rushed answers were wrong across your tests.`);
  if (totals.changeNet < 0)
    plan.push(`Trust your first answer unless you find a specific mistake: changing answers has cost you ${-totals.changeNet} marks in total.`);
  if (totals.notReached >= 5)
    plan.push(`You have left ${totals.notReached} questions unopened across your tests. Do a full first pass of every paper.`);
  if (totals.timeSinks >= 3) plan.push("Use a time cap: mark long questions for review and come back at the end.");
  if (trend.length < 3) plan.push("Take at least three full tests so your topic picture becomes reliable.");

  return {
    attempts: trend.length,
    trend,
    change: first && last && trend.length > 1 ? last.percent - first.percent : null,
    subjects: [...subjectMap.values()],
    mastered: mastered.slice(0, 8),
    focus,
    persistent,
    topicGrid,
    totals,
    plan,
  };
}
