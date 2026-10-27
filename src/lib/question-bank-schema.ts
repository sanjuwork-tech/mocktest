import { z } from "zod";
import { EXAM_SLUGS, SUBJECT_IDS } from "./exams/catalog.ts";

const idSchema = z.string().regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/).min(1).max(100);

const textRunSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(10000),
});

const mathRunSchema = z.object({
  type: z.literal("math"),
  latex: z.string().min(1).max(4000),
  spokenText: z.string().min(1).max(2000),
});

const runSchema = z.discriminatedUnion("type", [textRunSchema, mathRunSchema]);

const paragraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  runs: z.array(runSchema).min(1).max(100),
});

const displayMathBlockSchema = z.object({
  type: z.literal("display_math"),
  latex: z.string().min(1).max(4000),
  spokenText: z.string().min(1).max(2000),
});

const imageBlockSchema = z.object({
  type: z.literal("image"),
  assetId: idSchema,
  alt: z.string().min(1).max(2000),
  caption: z.string().min(1).max(2000).optional(),
});

const tableBlockSchema = z.object({
  type: z.literal("table"),
  caption: z.string().min(1).max(2000),
  headers: z.array(z.array(runSchema).min(1).max(20)).min(1).max(10),
  rows: z.array(z.array(z.array(runSchema).min(1).max(20)).min(1).max(10)).min(1).max(50),
});

const blockSchema = z.discriminatedUnion("type", [
  paragraphBlockSchema,
  displayMathBlockSchema,
  imageBlockSchema,
  tableBlockSchema,
]);

const contentSchema = z.array(blockSchema).min(1).max(50);

const optionSchema = z.object({
  id: idSchema,
  content: contentSchema,
});

const sourceSchema = z.object({
  kind: z.enum(["original", "ai_assisted", "licensed"]),
  reference: z.string().min(1).max(1000),
});

export const questionSchema = z.object({
  externalId: idSchema,
  type: z.literal("single_choice"),
  subject: z.enum(SUBJECT_IDS),
  topics: z.array(z.string().min(1).max(100)).min(1).max(10),
  difficulty: z.enum(["easy", "moderate", "hard"]),
  stem: contentSchema,
  options: z.array(optionSchema).length(4),
  answer: z.object({
    correctOptionId: idSchema,
  }),
  explanation: contentSchema,
  source: sourceSchema,
});

export const questionBankSchema = z.object({
  schemaVersion: z.literal("1.0"),
  bundleType: z.literal("question_bank"),
  bundleId: idSchema,
  title: z.string().min(1).max(200),
  language: z.enum(["en", "hi"]),
  questions: z.array(questionSchema).min(1).max(1000),
});

export const QuestionBankBundleSchema = questionBankSchema;
export type QuestionBankBundle = z.infer<typeof questionBankSchema>;


/**
 * One complete mock paper: its questions in exam order plus where it sits in the catalog.
 * Section sizes are checked against the exam blueprint when the paper is imported.
 */
export const testPaperSchema = z.object({
  schemaVersion: z.literal("1.0"),
  bundleType: z.literal("test_paper"),
  exam: z.enum(EXAM_SLUGS),
  /** Required for CUET (one paper per subject); omitted for multi-section exams. */
  subject: z.enum(SUBJECT_IDS).optional(),
  testNumber: z.number().int().min(1).max(100),
  title: z.string().min(1).max(200).optional(),
  free: z.boolean().default(false),
  language: z.enum(["en", "hi"]),
  questions: z.array(questionSchema).min(1).max(200),
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type TestPaper = z.infer<typeof testPaperSchema>;
