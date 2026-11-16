import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  notes, NOTES_PRICE, NOTES_INTERESTS, isNotesInterest, hubMeta, examMeta, subjectMeta, subjectFaqs, noteFor,
} from "../src/data/notes.ts";
import { EXAMS, EXAM_SLUGS, SUBJECT_IDS } from "../src/lib/exams/catalog.ts";
import { syllabusFor } from "../src/data/syllabus.ts";

const subjectsOf = (exam) => notes.filter((n) => n.exam === exam).map((n) => n.subject).sort();

describe("notes list", () => {
  it("covers exactly the exam subjects", () => {
    assert.deepEqual(subjectsOf("cuet-ug"), [...SUBJECT_IDS].sort());
    assert.equal(subjectsOf("cuet-ug").length, 13);
    assert.deepEqual(subjectsOf("iiser-iat"), ["biology", "chemistry", "mathematics", "physics"]);
    assert.deepEqual(subjectsOf("niser-nest"), ["biology", "chemistry", "mathematics", "physics"]);
    assert.deepEqual(subjectsOf("comedk"), ["chemistry", "mathematics", "physics"]);
    assert.equal(notes.length, 13 + 4 + 4 + 3);
  });

  it("prices every subject at 149 and keeps slugs unique", () => {
    assert.equal(NOTES_PRICE, 149);
    for (const n of notes) assert.equal(n.price, 149, n.slug);
    assert.equal(new Set(notes.map((n) => n.slug)).size, notes.length);
  });

  it("has a page param for every note and matches the syllabus data", () => {
    for (const n of notes) {
      assert.ok(EXAMS[n.exam].subjects.includes(n.subject));
      assert.equal(noteFor(n.exam, n.subject), n);
      assert.equal(n.path, `/notes/${n.exam}/${n.subject}`);
      const official = syllabusFor(n.exam).subjects.find((s) => s.id === n.subject);
      assert.equal(n.unitCount, official ? official.groups.flatMap((g) => g.units).length : 0, n.slug);
    }
  });

  it("accepts only real notes interests for the waitlist", () => {
    assert.ok(isNotesInterest("notes-cuet-ug-physics"));
    assert.ok(isNotesInterest("notes-all"));
    for (const e of EXAM_SLUGS) assert.ok(isNotesInterest(`notes-${e}`));
    for (const n of notes) assert.ok(NOTES_INTERESTS.includes(n.interest));
    for (const bad of ["notes-comedk-biology", "notes-", "notes-cuet-ug-physics ", "cuet-ug-physics", "notes-all;drop", 5, undefined])
      assert.equal(isNotesInterest(bad), false, String(bad));
  });

  it("keeps titles and descriptions within search limits (template adds ' | OurMocks')", () => {
    const metas = [hubMeta, ...EXAM_SLUGS.map(examMeta), ...notes.map(subjectMeta)];
    for (const m of metas) {
      assert.ok(m.title.length <= 60 - 11, `${m.title} (${m.title.length})`);
      assert.ok(m.description.length <= 155, `${m.description} (${m.description.length})`);
    }
    assert.equal(new Set(metas.map((m) => m.title)).size, metas.length, "titles are unique");
  });

  it("does not invent claims", () => {
    const text = JSON.stringify(notes.map(subjectFaqs));
    for (const bad of [/guarantee/i, /\d+ pages|page count/i, /rating/i, /students (have|use)/i]) assert.doesNotMatch(text, bad);
  });
});
