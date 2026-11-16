import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createQuestionTimer, formatQuestionTime } from "../src/lib/question-timer.ts";

describe("question timer", () => {
  it("accumulates while shown and resumes when the question is revisited", () => {
    const t = createQuestionTimer();
    t.show("q1", 0, false);
    assert.equal(t.elapsed("q1", 5000), 5000);
    t.show("q2", 5000, false);
    t.show("q1", 8000, false);
    assert.equal(t.elapsed("q1", 10000), 7000);
    assert.equal(t.elapsed("q2", 10000), 3000);
  });

  it("seeds from saved time without re-sending it", () => {
    const t = createQuestionTimer();
    t.seed({ q1: 60_000 });
    t.seed({ q1: 1 }); // a repeat load never overwrites
    t.show("q1", 0, false);
    assert.equal(t.elapsed("q1", 2000), 62_000);
    const d = t.takeDeltas(2000);
    assert.deepEqual(d, [{ assignmentId: "q1", addMs: 2000, visits: 1 }]);
    assert.equal(t.elapsed("q1", 2000), 62_000);
    assert.deepEqual(t.takeDeltas(3000), [{ assignmentId: "q1", addMs: 1000, visits: 0 }]);
  });

  it("pauses while hidden and resumes after", () => {
    const t = createQuestionTimer();
    t.show("q1", 0, false);
    t.pause(4000);
    assert.equal(t.elapsed("q1", 50_000), 4000);
    t.resume(50_000);
    assert.equal(t.elapsed("q1", 51_000), 5000);
    const hiddenStart = createQuestionTimer();
    hiddenStart.show("q1", 0, true);
    assert.equal(hiddenStart.elapsed("q1", 9000), 0);
  });

  it("never double counts across flushes and restores failed sends", () => {
    const t = createQuestionTimer();
    t.seed({ q1: 1000 });
    t.show("q1", 0, false);
    const a = t.takeDeltas(3000);
    const b = t.takeDeltas(5000);
    assert.equal(a[0].addMs + b[0].addMs, 5000);
    t.restore(b);
    assert.equal(t.takeDeltas(5000)[0].addMs, 2000);
    assert.equal(t.elapsed("q1", 5000), 6000);
    assert.equal(t.hasUnsent(), false);
  });

  it("formats mm:ss and h:mm:ss", () => {
    assert.equal(formatQuestionTime(83_000), "01:23");
    assert.equal(formatQuestionTime(3_725_000), "1:02:05");
    assert.equal(formatQuestionTime(0), "00:00");
  });
});
