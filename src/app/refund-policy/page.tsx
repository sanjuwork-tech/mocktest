import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { siteConfig } from "@/data/catalog";
import "./refund-policy.css";

// DRAFT policy written 2026-11-05 — the owner must confirm it before paid enrolment opens.
export const metadata = pageMetadata(
  "Refund and Cancellation Policy",
  "When you can get a refund for an OurMocks test series, how to ask for one, how long it takes, and how cancellation works.",
  "/refund-policy",
);

export default function RefundPolicyPage() {
  const mail = siteConfig.email;
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="guide-hero page-shell">
        <p className="eyebrow">Legal</p>
        <h1>
          Refund and Cancellation Policy
          <br />
          <em>Fair, simple and in writing.</em>
        </h1>
        <p className="hero-copy">
          Last updated: 5 November 2026. This policy covers payments for
          OurMocks test series. Paid enrolment has not opened yet; this policy
          applies to every purchase from the day it opens.
        </p>
      </section>
      <div className="page-shell reading-copy">
        <section aria-labelledby="rp-before">
          <h2 id="rp-before">1. Try before you pay</h2>
          <p>
            Test 1 of every exam, and of every CUET subject, is free. It is a
            full-length test with the same solutions and analysis as the paid
            tests, so you can decide whether a series suits you before paying
            anything.
          </p>
        </section>
        <section aria-labelledby="rp-full">
          <h2 id="rp-full">2. When you can get a full refund</h2>
          <p>You can ask for a full refund if both of these are true:</p>
          <ul className="rp-list">
            <li>you ask within 7 days of the date you paid, and</li>
            <li>
              you have started no more than one paid test in that purchase (free
              Test 1s don&apos;t count).
            </li>
          </ul>
          <p>
            For a bundle, the same rule applies to the whole bundle: paid tests
            started in any of its exams count together.
          </p>
        </section>
        <section aria-labelledby="rp-always">
          <h2 id="rp-always">3. When we always refund you</h2>
          <p>Whatever the date and however many tests you have taken, we refund in full if:</p>
          <ul className="rp-list">
            <li>you were charged twice for the same purchase (we refund the extra payment);</li>
            <li>
              you were charged but did not get access because of a technical
              problem on our side that we cannot fix within 3 working days of
              you telling us;
            </li>
            <li>we withdraw a series you have paid for.</li>
          </ul>
        </section>
        <section aria-labelledby="rp-not">
          <h2 id="rp-not">4. When a refund is not possible</h2>
          <ul className="rp-list">
            <li>more than 7 days have passed since you paid, or</li>
            <li>you have started two or more paid tests in that purchase,</li>
          </ul>
          <p>
            unless one of the cases in section 3 applies. A refund is also not
            possible for an account closed for breaking our{" "}
            <Link href="/terms" className="text-link">
              Terms of Service
            </Link>
            , for example by sharing a login or copying test questions.
          </p>
        </section>
        <section aria-labelledby="rp-how">
          <h2 id="rp-how">5. How to ask for a refund</h2>
          <p>
            Email{" "}
            <a href={`mailto:${mail}?subject=${encodeURIComponent("Refund request")}`} className="text-link">
              {mail}
            </a>{" "}
            from the email address on your OurMocks account. Please include the
            series you bought, the date you paid and, if you have it, the payment
            ID from your receipt. A parent or guardian may ask on behalf of a
            student under 18.
          </p>
        </section>
        <section aria-labelledby="rp-time">
          <h2 id="rp-time">6. How long it takes</h2>
          <p>
            We reply within 2 working days to tell you whether the refund is
            approved. Approved refunds are processed within 5–7 working days, to
            the same card, UPI account, bank account or wallet you paid with. Your
            bank may take a few more days to show the money in your account. Once
            a refund is issued, access to that series ends.
          </p>
        </section>
        <section aria-labelledby="rp-failed">
          <h2 id="rp-failed">7. Failed or pending payments</h2>
          <p>
            If money left your account but your payment shows as failed and you
            did not get access, it is usually returned automatically by the
            payment provider or your bank. If it has not come back within 7
            working days, email us with the details and we will help you trace it.
          </p>
        </section>
        <section aria-labelledby="rp-cancel">
          <h2 id="rp-cancel">8. Cancellation</h2>
          <p>
            Test series are one-time purchases, not subscriptions: nothing renews
            and you are never charged again automatically. You can cancel an
            order at any time before the payment is completed by closing the
            payment window. After you have paid, cancelling means asking for a
            refund under sections 2 and 3.
          </p>
        </section>
        <section aria-labelledby="rp-contact">
          <h2 id="rp-contact">9. Questions</h2>
          <p>
            Write to{" "}
            <a href={`mailto:${mail}`} className="text-link">
              {mail}
            </a>{" "}
            or see our <Link href="/about" className="text-link">About page</Link>{" "}
            for other ways to reach us. See also our{" "}
            <Link href="/terms" className="text-link">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="text-link">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
