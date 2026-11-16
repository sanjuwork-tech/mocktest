import assert from "node:assert/strict";
import test from "node:test";
import { assetIdFor, externalIdFor, stripOption, toBlocks } from "../scripts/import-mock-questions.mjs";

test("inline \\( \\) maths becomes a math run", () => {
  const [p] = toBlocks("Find \\(x^2\\) now");
  assert.deepEqual(p.runs.map((r) => r.type), ["text", "math", "text"]);
  assert.equal(p.runs[1].latex, "x^2");
});

test("display \\[ \\] maths becomes a display_math block", () => {
  const blocks = toBlocks("Given:\n\\[E=mc^2\\]\nDone");
  assert.deepEqual(blocks.map((b) => b.type), ["paragraph", "display_math", "paragraph"]);
  assert.equal(blocks[1].latex, "E=mc^2");
});

test("a literal $ stays text, and newlines make paragraphs", () => {
  const blocks = toBlocks("Costs $5 and $10\nSecond line");
  assert.equal(blocks.length, 2);
  assert.deepEqual(blocks[0].runs, [{ type: "text", text: "Costs $5 and $10" }]);
});

test("option prefixes are stripped and ids are normalised", () => {
  assert.equal(stripOption("B) Some answer"), "Some answer");
  assert.equal(externalIdFor("CUET27_PHY.T01 Q01"), "cuet27-phy-t01-q01");
});

test("asset ids are 24 lowercase hex characters", () => {
  assert.match(assetIdFor(Buffer.from("image")), /^[a-f0-9]{24}$/);
});

test("a Markdown pipe table becomes a captioned table block", () => {
  const blocks = toBlocks("Study the table.\n\nBirth rate of Country X\n\n| Year | CBR |\n|---|---|\n| 1900 | 40 |\n| 1930 | \\(39\\) |\n\nQuestion: Which year?");
    const table = blocks.find((b) => b.type === "table");
    assert.equal(table.caption, "Birth rate of Country X");
    assert.equal(table.headers.length, 2);
    assert.equal(table.rows.length, 2);
    assert.equal(table.rows[1][1][0].type, "math");
    assert.ok(!blocks.some((b) => b.type === "paragraph" && b.runs.some((r) => r.text?.startsWith("|"))));
});
