import { pageMetadata } from "@/lib/page-metadata";
import { FreeDiagnosticClient } from "./client";

export const metadata = pageMetadata(
  "Free Full-Length Mock Tests — CUET UG Official Pattern & Diagnostic Mocks",
  "Attempt full-length 50-question CUET UG mock tests across 13 subjects completely free. Experience the real CBT interface with live question timers and instant diagnostic reports.",
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

export default function FreeDiagnosticPage() {
  return <FreeDiagnosticClient />;
}
