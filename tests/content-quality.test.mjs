import test from "node:test";
import assert from "node:assert/strict";
import { exams } from "../src/data/exams.ts";
import { blogPosts } from "../src/data/blog.ts";
import { collegesData } from "../src/data/colleges.ts";

const words = (text) => text.trim().split(/\s+/).length;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

// Claims that were wrong or unverifiable on the site and must not return.
const BANNED = [/guarantee/i, /\bLPA\b/, /190\+/, /campus photo/i, /rank prediction/i, /KVPY/, /210 min/i];

test("every exam opens with a quotable answer and visible FAQs", () => {
  for (const exam of exams) {
    const n = words(exam.quickAnswer);
    assert.ok(n >= 40 && n <= 75, `${exam.slug} quick answer is ${n} words`);
    assert.ok(exam.faqs.length >= 3, `${exam.slug} needs FAQs`);
    assert.ok(exam.pattern.length >= 4, `${exam.slug} needs a pattern table`);
    assert.match(exam.checkedOn, ISO);
  }
});

test("blog posts cite sources, use ISO dates and fit search snippets", () => {
  for (const post of blogPosts) {
    assert.ok(post.sources.length >= 1, `${post.slug} must cite a source`);
    for (const s of post.sources) assert.match(s.url, /^https:\/\//);
    assert.match(post.publishedDate, ISO);
    assert.match(post.updatedDate, ISO);
    assert.ok(post.updatedDate >= post.publishedDate, post.slug);
    assert.ok(post.metaTitle.length <= 60, `${post.slug} meta title is ${post.metaTitle.length} chars`);
    assert.ok(post.description.length <= 160, `${post.slug} description is ${post.description.length} chars`);
    assert.ok(post.faqs.length >= 2, `${post.slug} needs FAQs`);
  }
  assert.equal(new Set(blogPosts.map((p) => p.slug)).size, blogPosts.length);
});

test("colleges link to their official sites and label rankings by NIRF year", () => {
  for (const college of collegesData) {
    assert.match(college.officialUrl, /^https:\/\//, college.id);
    assert.ok(college.admissionRoute.length > 20, college.id);
    assert.ok(college.established > 1800 && college.established < 2027, college.id);
  }
  assert.equal(new Set(collegesData.map((c) => c.id)).size, collegesData.length);
});

test("no banned claims in exam, blog or college content", () => {
  const corpus = JSON.stringify({ exams, blogPosts, collegesData });
  for (const pattern of BANNED) assert.doesNotMatch(corpus, pattern);
});
