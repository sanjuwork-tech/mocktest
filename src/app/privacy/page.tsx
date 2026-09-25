import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";

export const metadata = pageMetadata(
  "Privacy Policy",
  "How TestDisha collects, uses, and protects your personal data.",
  "/privacy",
);

export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="guide-hero page-shell">
        <p className="eyebrow">Legal</p>
        <h1>
          Privacy Policy
          <br />
          <em>Your data, our responsibility.</em>
        </h1>
        <p className="hero-copy">
          Last updated: September 2026. This policy explains how TestDisha
          collects, uses, and protects your personal data.
        </p>
      </section>
      <div className="page-shell reading-copy">
        <section>
          <h2>Information we collect</h2>
          <p>
            When you create an account, purchase a test series, or contact us,
            we may collect your name, email address, phone number, payment
            information, and usage data (pages visited, test attempts, scores).
          </p>
          <p>
            We use cookies and similar technologies for authentication, security,
            and analytics. You can manage cookie preferences through your browser
            settings.
          </p>
        </section>
        <section>
          <h2>How we use your data</h2>
          <ul>
            <li>To provide access to purchased test series and track your progress</li>
            <li>To process payments securely through our payment partner (Razorpay)</li>
            <li>To send transactional emails (purchase confirmations, password resets)</li>
            <li>To improve our platform based on aggregated, anonymised usage patterns</li>
            <li>To prevent fraud and ensure platform security</li>
          </ul>
          <p>
            We do not sell your personal data to third parties. We do not use
            your data for targeted advertising.
          </p>
        </section>
        <section>
          <h2>Payment processing</h2>
          <p>
            Payments are processed by Razorpay. We do not store your credit/debit
            card details. Razorpay's privacy policy and PCI DSS compliance apply
            to payment data.
          </p>
        </section>
        <section>
          <h2>Data retention</h2>
          <p>
            Account data is retained while your account is active. Test attempt
            history is retained to provide you with performance analytics. You
            may request deletion of your account and associated data by
            contacting us.
          </p>
        </section>
        <section>
          <h2>Data security</h2>
          <p>
            We use industry-standard security measures including encrypted
            connections (HTTPS), hashed passwords (scrypt), secure session
            tokens, CSRF protection, and rate limiting. Access to personal data
            is restricted to authorised personnel.
          </p>
        </section>
        <section>
          <h2>Your rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Withdraw consent for non-essential data processing</li>
          </ul>
        </section>
        <section>
          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be
            communicated via email or a notice on our website. Continued use of
            the platform after changes constitutes acceptance.
          </p>
        </section>
        <section>
          <h2>Contact us</h2>
          <p>
            For privacy-related questions, visit our{" "}
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
