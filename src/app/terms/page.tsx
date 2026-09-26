import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";

export const metadata = pageMetadata(
  "Terms of Service",
  "The terms and conditions that govern your use of TestDisha.",
  "/terms",
);

export default function TermsPage() {
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
          Last updated: September 2026. These terms govern your use of
          TestDisha. By using our platform, you agree to these terms.
        </p>
      </section>
      <div className="page-shell reading-copy">
        <section>
          <h2>1. About TestDisha</h2>
          <p>
            TestDisha is an educational platform that provides exam information
            and mock test series for entrance examinations including CUET UG,
            IISER IAT, NISER NEST, and COMEDK UGET. TestDisha is independent of
            the examination authorities.
          </p>
        </section>
        <section>
          <h2>2. Accounts</h2>
          <p>
            You must provide accurate information when creating an account. You
            are responsible for maintaining the confidentiality of your login
            credentials and for all activity under your account.
          </p>
          <p>
            You must be at least 13 years old to use TestDisha. If you are under
            18, you confirm that you have your parent or guardian&apos;s consent.
          </p>
        </section>
        <section>
          <h2>3. Purchases & Refunds</h2>
          <p>
            Test series are digital products. Prices displayed at the time of
            purchase are final. All payments are processed securely through
            Razorpay in Indian Rupees (INR).
          </p>
          <p>
            Refunds may be requested within 7 days of purchase if no tests have
            been attempted. Once a test attempt has been started, the purchase is
            considered used and is not eligible for a refund.
          </p>
        </section>
        <section>
          <h2>4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Share your account credentials or test access with others</li>
            <li>Copy, reproduce, or redistribute test content</li>
            <li>Use automated tools to access or scrape the platform</li>
            <li>Attempt to bypass payment or access controls</li>
            <li>Engage in any activity that disrupts the platform</li>
          </ul>
          <p>
            Violation of these terms may result in account suspension or
            termination without refund.
          </p>
        </section>
        <section>
          <h2>5. Exam information</h2>
          <p>
            Exam guides on TestDisha are summaries of publicly available official
            information. We review and date-stamp our information but do not
            guarantee real-time accuracy. Official exam authority websites take
            precedence. See our{" "}
            <Link href="/about#information-policy" className="text-link">
              information review policy
            </Link>
            .
          </p>
          <p>
            TestDisha does not promise admission, rank, scholarship, or career
            outcomes. Mock test scores are for practice purposes only and do not
            predict actual exam performance.
          </p>
        </section>
        <section>
          <h2>6. Intellectual property</h2>
          <p>
            All content on TestDisha — including test questions, solutions,
            analytics, design, and branding — is owned by TestDisha or licensed
            to us. You may not reproduce, distribute, or create derivative works
            without written permission.
          </p>
        </section>
        <section>
          <h2>7. Limitation of liability</h2>
          <p>
            TestDisha is provided &quot;as is&quot; without warranties of any kind. We are
            not liable for any indirect, incidental, or consequential damages
            arising from your use of the platform, including but not limited to
            exam results, admission outcomes, or data loss.
          </p>
        </section>
        <section>
          <h2>8. Privacy</h2>
          <p>
            Your use of TestDisha is also governed by our{" "}
            <Link href="/privacy" className="text-link">
              Privacy Policy
            </Link>
            , which explains how we collect and use your data.
          </p>
        </section>
        <section>
          <h2>9. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Material changes will
            be communicated via email or a notice on our website. Continued use
            after changes constitutes acceptance.
          </p>
        </section>
        <section>
          <h2>10. Governing law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be
            subject to the exclusive jurisdiction of the courts in India.
          </p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>
            For questions about these terms, visit our{" "}
            <Link href="/about" className="text-link">
              About page
            </Link>{" "}
            for contact information.
          </p>
        </section>
      </div>
    </main>
  );
}
