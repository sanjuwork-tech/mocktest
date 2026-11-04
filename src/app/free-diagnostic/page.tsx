import { pageMetadata } from "@/lib/page-metadata";
import { databaseConfigured } from "@/db/client";
import { publishedTests } from "@/server/student-tests";
import { FreeDiagnosticClient } from "./client";

export const metadata = pageMetadata(
  "Free Full-Length Mock Tests: CUET UG, IISER IAT, NEST, COMEDK",
  "Test 1 is free for every exam: a full-length mock on the official pattern and marking, then time spent per question, rushed and slow answers, and topics to revise.",
  "/free-diagnostic",
  [
    "free full length mock test",
    "free CUET mock test",
    "CUET UG full test free",
    "free IISER IAT mock test",
    "free NEST mock test",
    "free COMEDK mock test",
  ],
);

/** "exam:subject" for every published free Test 1, or null when the database can't be read. */
async function liveFreeTests() {
  if (!databaseConfigured) return null;
  try {
    const tests = await publishedTests();
    return tests.filter((t) => t.isFree && t.testNumber === 1).map((t) => `${t.exam}:${t.subject ?? ""}`);
  } catch (error) {
    console.error("free_tests_unavailable", error instanceof Error ? error.message : error);
    return null;
  }
}

// ?exam= opens that exam's tab, so "Notify me" links from IAT, NEST and COMEDK pages land on the right waitlist.
export default async function FreeDiagnosticPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const [{ exam }, live] = await Promise.all([searchParams, liveFreeTests()]);
  return <FreeDiagnosticClient initialExam={exam} live={live} />;
}
