// Shared facts for the privacy policy, terms, grievance section and the sign-up consent record.
// Kept free of "@/" imports so tests/legal-consent.test.mjs can load it directly with node.
import { z } from "zod";

/** Bump when the privacy policy or terms change in substance; every sign-up records the version it agreed to. */
export const POLICY_VERSION = "2026-11-05";
export const POLICY_EFFECTIVE = "5 November 2026";

/**
 * Official sources, checked 2026-11-05.
 * - DPDP Act 2023 (No. 22 of 2023): https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf
 *   s.2(f) child = under 18; s.5 notice; s.6 consent and withdrawal; s.8(6) breach intimation; s.8(7) erasure;
 *   s.8(9) contact person; s.8(10) grievance mechanism; s.9 children (verifiable parental consent, no tracking,
 *   behavioural monitoring or targeted ads); ss.11-14 access, correction, erasure, grievance, nomination;
 *   s.13(3) grievance with us first, then the Board; Schedule: penalties up to ₹250 crore.
 * - DPDP Rules 2025, G.S.R. 846(E), Gazette of India Extraordinary No. 760, published 13 November 2025:
 *   https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf
 *   Rule 1: rules 1, 2, 17-21 in force from 13 Nov 2025; rule 4 (Consent Managers) from 13 Nov 2026;
 *   rules 3, 5-16, 22, 23 (notice, security, breach, retention, contact, children, rights) from 13 May 2027.
 *   Rule 3 notice; Rule 6 security (logs kept one year); Rule 7 breach (users without delay, Board within 72 h);
 *   Rule 8(3) keep processing logs at least one year; Rule 9 publish contact; Rule 10 verifiable parental consent;
 *   Rule 14(3) grievances answered within a published period of at most 90 days.
 * - PIB, "Government notifies DPDP Rules to empower citizens and protect privacy", 14 Nov 2025 (PRID 2190014),
 *   and PIB backgrounder "DPDP Rules, 2025 Notified", 17 Nov 2025 (PRID 2190655).
 * - IT (Intermediary Guidelines and Digital Media Ethics Code) Rules 2021, consolidated to 10.02.2026, rule 3(2):
 *   acknowledge within 24 hours, resolve within 7 days. https://www.meity.gov.in/static/uploads/2026/03/0b576f2071694b52e4cd6bb1b6dfab1e.pdf
 *   We follow these timelines for general complaints as good practice.
 */
export const LEGAL_SOURCES = [
  {
    label: "Digital Personal Data Protection Act, 2023 (MeitY)",
    url: "https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf",
  },
  {
    label: "Digital Personal Data Protection Rules, 2025 — Gazette of India, G.S.R. 846(E), 13 November 2025 (MeitY)",
    url: "https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf",
  },
  {
    label: "PIB: Government notifies DPDP Rules, 14 November 2025",
    url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014",
  },
  {
    label: "IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, updated to 10 February 2026 (MeitY)",
    url: "https://www.meity.gov.in/static/uploads/2026/03/0b576f2071694b52e4cd6bb1b6dfab1e.pdf",
  },
] as const;
export const SOURCES_CHECKED = "5 November 2026";

export const GRIEVANCE_ROLE = "Grievance Officer, OurMocks";

/**
 * Age and consent given at sign-up. "adult" and "guardian" match tool_submissions.consent_basis.
 * A parent's email is collected for under-18s so a confirmation step can be added once the site sends email
 * (DPDP Rules 2025, rule 10). Until then the record says guardianVerified: false.
 */
export const signupConsentSchema = z
  .object({
    ageBasis: z.enum(["adult", "guardian"], { message: "Please tell us whether you are 18 or older." }),
    guardianEmail: z.string().trim().max(200).optional(),
    acceptTerms: z.literal(true, { message: "Please agree to the Terms and Privacy Policy to create an account." }),
  })
  .superRefine((value, ctx) => {
    if (value.ageBasis !== "guardian") return;
    if (!value.guardianEmail || !z.email().safeParse(value.guardianEmail).success) {
      ctx.addIssue({ code: "custom", path: ["guardianEmail"], message: "Please enter your parent or guardian's email address." });
    }
  });

export type SignupConsent = z.infer<typeof signupConsentSchema>;

/** The consent entry stored in the registration audit_log row's details. */
export function consentRecord(consent: SignupConsent, studentEmail: string, now = new Date()) {
  const guardianEmail = consent.ageBasis === "guardian" ? consent.guardianEmail!.trim().toLowerCase() : null;
  if (guardianEmail && guardianEmail === studentEmail.trim().toLowerCase()) {
    throw new Error("Your parent or guardian's email must be different from yours.");
  }
  return {
    basis: consent.ageBasis,
    guardianEmail,
    // Self-declared until a parent confirmation email exists; see the privacy policy, "Students under 18".
    guardianVerified: false,
    method: "signup_form_declaration",
    policyVersion: POLICY_VERSION,
    consentedAt: now.toISOString(),
  };
}
