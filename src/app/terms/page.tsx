import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { siteConfig } from "@/data/catalog";
import { GRIEVANCE_ROLE, POLICY_EFFECTIVE, POLICY_VERSION } from "../privacy/legal";
import "../privacy/legal.css";

// Age and parental consent follow the DPDP Act 2023 s.2(f) and s.9 and DPDP Rules 2025 rule 10; see ../privacy/legal.ts.
export const metadata = pageMetadata(
  "Terms of Service",
  "The rules for using OurMocks: who can sign up, guest sessions, fair use, our questions, practice-only scores, payments and complaints.",
  "/terms",
);

export default function TermsPage() {
  const mail = siteConfig.email;
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="guide-hero page-shell">
        <p className="eyebrow">Legal</p>
        <h1>
          Terms of Service
          <br />
          <em>What we agree on.</em>
        </h1>
        <p className="hero-copy">
          Effective {POLICY_EFFECTIVE} (version {POLICY_VERSION}). These terms are the agreement between you and
          OurMocks when you use this website. Please read them with our{" "}
          <Link href="/privacy" className="text-link">Privacy Policy</Link>.
        </p>
      </section>
      <div className="page-shell reading-copy legal-copy">
        <section aria-labelledby="t-about">
          <h2 id="t-about">1. About OurMocks</h2>
          <p>
            OurMocks provides exam information and mock tests for entrance exams after Class 12, including CUET UG,
            IISER IAT, NISER NEST and COMEDK UGET. OurMocks is independent. We are not part of, or approved by, the
            NTA, IISERs, NISER, COMEDK or any other exam body.
          </p>
        </section>

        <section aria-labelledby="t-eligibility">
          <h2 id="t-eligibility">2. Who can use OurMocks</h2>
          <ul>
            <li>If you are 18 or older, you can create an account and agree to these terms yourself.</li>
            <li>
              If you are under 18, you need your parent or lawful guardian’s agreement to create an account or use
              a guest session, and you must give their email address when you sign up. By choosing “I am under 18,
              and my parent or guardian agrees”, you confirm that they have read these terms and the Privacy Policy
              and agree to them on your behalf. See <Link href="/privacy#children">Students under 18</Link>.
            </li>
            <li>Parents and guardians: if your child signed up without your agreement, email us and we will close the account and delete its data.</li>
            <li>Please tell the truth about your age. We may close an account if we learn that the age or consent given was not true.</li>
          </ul>
        </section>

        <section aria-labelledby="t-accounts">
          <h2 id="t-accounts">3. Accounts and guest sessions</h2>
          <p>
            Give a real name and an email you can use. Keep your password private; you are responsible for what
            happens under your account. One account is for one student. Tell us at once if you think someone
            else has used your account.
          </p>
          <p>
            A guest session lets you try tests without giving a name or email. It lives only in the browser you
            used. If you sign out or clear your cookies before creating an account, the guest session and its
            results cannot be recovered. You can turn a guest session into a full account at any time to keep
            your results.
          </p>
          <p>
            You can close your account at any time by emailing us (see <Link href="/privacy#rights">your rights</Link>).
            We may suspend or close an account that breaks these terms, after telling you why where we can.
          </p>
        </section>

        <section aria-labelledby="t-use">
          <h2 id="t-use">4. Fair use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>share your account, or sell or give away access to tests;</li>
            <li>copy, screenshot, record, publish or resell our questions, solutions or analysis;</li>
            <li>use bots, scrapers or other automated tools on the site;</li>
            <li>try to get around sign-in, payment, rate limits or other protections, or to see answers before submitting;</li>
            <li>upload anything harmful, or try to break, overload or probe the site for weaknesses without our permission;</li>
            <li>pretend to be someone else, or give false details, including about your age or a parent’s consent.</li>
          </ul>
          <p>Found a security problem? Please email us instead of testing it on the live site; we are grateful for reports.</p>
        </section>

        <section aria-labelledby="t-ip">
          <h2 id="t-ip">5. Our questions and content</h2>
          <p>
            Our mock-test questions, solutions, analysis, explanations, guides, design and the OurMocks name are
            owned by OurMocks or used with permission. We give you a personal, non-transferable right to use them
            for your own exam practice. You may not copy, share, publish or sell them, or use them to build another
            product or train software, without our written permission.
          </p>
          <p>
            Official exam papers, syllabi and notices belong to the bodies that publish them. Where we link to or
            quote them, the official source is named. Your own answers and reflections remain yours.
          </p>
        </section>

        <section aria-labelledby="t-practice">
          <h2 id="t-practice">6. Scores and predictions are for practice only</h2>
          <p>
            Mock-test scores, analysis and predictor or calculator results are practice
            estimates made by OurMocks. They are not official results and do not tell you what you will score,
            what rank you will get, or whether you will be admitted. Exam patterns, dates and rules can change; the
            official exam website and bulletin always take precedence. We check and date our information (see our{" "}
            <Link href="/about#information-policy">information review policy</Link>), but we may make mistakes. If
            you spot one, please tell us.
          </p>
          <p>OurMocks does not promise any admission, rank, scholarship or career outcome.</p>
        </section>

        <section aria-labelledby="t-payments">
          <h2 id="t-payments">7. Payments</h2>
          <p>
            Paid test series are not on sale yet. Test 1 of every exam, and of every CUET subject, is free. When
            paid series open, prices will be shown in Indian rupees before you pay, payments will be handled by our
            payment provider (Razorpay), and refunds will follow our{" "}
            <Link href="/refund-policy">Refund and Cancellation Policy</Link>.
          </p>
        </section>

        <section aria-labelledby="t-privacy">
          <h2 id="t-privacy">8. Your privacy</h2>
          <p>
            How we collect and use personal data, how long we keep it and how to see, correct or delete it is
            explained in our <Link href="/privacy">Privacy Policy</Link>, which is part of these terms.
          </p>
        </section>

        <section aria-labelledby="t-liability">
          <h2 id="t-liability">9. Availability and limits of our responsibility</h2>
          <p>
            We work to keep OurMocks running and accurate, but we provide it “as is”. The site may sometimes be
            unavailable, and content may contain errors. Your answers save as you go, but please keep your own
            notes of anything important.
          </p>
          <p>
            As far as the law allows, OurMocks is not responsible for indirect losses, such as exam results,
            admission decisions or missed deadlines, that come from using the site. If we are found responsible for
            a loss, our total responsibility is limited to the amount you paid us in the 12 months before the
            claim. Nothing in these terms takes away rights you have under
            Indian consumer protection or data protection law.
          </p>
        </section>

        <section aria-labelledby="t-changes">
          <h2 id="t-changes">10. Changes to these terms</h2>
          <p>
            We may update these terms. The version and date at the top will change, and we will tell signed-in
            students about important changes on the site before they take effect. If you do not agree with a
            change, you can stop using OurMocks and ask us to delete your account.
          </p>
        </section>

        <section aria-labelledby="t-law">
          <h2 id="t-law">11. Governing law</h2>
          <p>
            These terms are governed by the laws of India. We will try to settle any disagreement with you first
            through our grievance process. Otherwise, the courts in India have jurisdiction. Complaints about
            personal data can also go to the Data Protection Board of India.
          </p>
        </section>

        <section aria-labelledby="t-contact">
          <h2 id="t-contact">12. Contact and complaints</h2>
          <p>
            {GRIEVANCE_ROLE}: <a href={`mailto:${mail}`}>{mail}</a>. We acknowledge complaints within 24 hours and
            aim to resolve them within 7 days. How complaints work, and where to go next, is set out on our{" "}
            <Link href="/about#grievance">grievance page</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
