import { z } from "zod";

export const sectionBlueprintSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  subject: z.enum([
    "mathematics",
    "physics",
    "chemistry",
    "biology",
    "english",
    "general-aptitude",
  ]),
  required: z.boolean().default(true),
  questionCount: z.number().int().positive(),
  marksPerQuestion: z.number().int().positive(),
  penaltyPerQuestion: z.number().int().min(0),
  permittedAnswerTypes: z.array(z.literal("single_choice")).min(1),
});

export const examBlueprintSchema = z.object({
  id: z.string().min(1),
  examSlug: z.enum(["iiser-iat", "cuet-ug", "niser-nest", "comedk"]),
  cycleYear: z.number().int().min(2024).max(2030),
  title: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  totalQuestions: z.number().int().positive(),
  totalMarks: z.number().int().positive(),
  navigation: z.enum(["free", "section_timed"]),
  allowBacktracking: z.boolean().default(true),
  sections: z.array(sectionBlueprintSchema).min(1),
  scoringPolicy: z.object({
    unansweredMarks: z.number().default(0),
    explanationRelease: z.enum(["immediate", "after_deadline", "manual"]),
  }),
  officialSource: z.object({
    title: z.string(),
    url: z.string().url(),
    checkedOn: z.string(),
  }),
});

export type SectionBlueprint = z.infer<typeof sectionBlueprintSchema>;
export type ExamBlueprint = z.infer<typeof examBlueprintSchema>;
