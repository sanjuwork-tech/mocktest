import { pageMetadata } from "@/lib/page-metadata";
import { FreeDiagnosticClient } from "./client";

export const metadata = pageMetadata(
  "Free CUET UG Mock Test, Full Length",
  "Take a full-length 50-question CUET UG mock test free in 12 subjects, timed like the real exam, with a section and topic report afterwards.",
  "/free-diagnostic",
  [
    "free full length mock test",
    "free CUET mock test",
    "CUET UG full test free",
    "CUET free test paper 1",
    "CUET practice test free",
    "entrance exam mock test",
  ],
);

// ?exam= opens that exam's tab, so "Notify me" links from IAT, NEST and COMEDK pages land on the right waitlist.
export default async function FreeDiagnosticPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const { exam } = await searchParams;
  return <FreeDiagnosticClient initialExam={exam} />;
}
