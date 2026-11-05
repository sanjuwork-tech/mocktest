import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { siteConfig } from "@/data/catalog";
import { GRIEVANCE_ROLE, LEGAL_SOURCES, POLICY_EFFECTIVE, POLICY_VERSION, SOURCES_CHECKED } from "./legal";
import "./legal.css";

// Written against the DPDP Act 2023 and DPDP Rules 2025 (G.S.R. 846(E), 13 Nov 2025); sources and rule numbers
// are listed in ./legal.ts and at the foot of this page. Retention periods are OurMocks' own choices, not set by law,
// except the one-year minimum for logs (Rules 6(1)(e) and 8(3)). The owner must confirm them.
export const metadata = pageMetadata(
  "Privacy Policy",
  "What personal data OurMocks collects, why, how long we keep it, and how students and parents can access, correct or delete it.",
  "/privacy",
);

export default function PrivacyPolicyPage() {
  const mail = siteConfig.email;
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="guide-hero page-shell">
        <p className="eyebrow">Legal</p>
        <h1>
          Privacy Policy
          <br />
          <em>What we keep, and why.</em>
        </h1>
        <p className="hero-copy">
          Effective {POLICY_EFFECTIVE} (version {POLICY_VERSION}). This page tells you, in plain words, what
          personal data OurMocks collects, what we use it for, how long we keep it, and how you or your parent
          can see, correct or delete it.
        </p>
      </section>
      <div className="page-shell reading-copy legal-copy">
        <nav aria-label="On this page" className="legal-toc">
          <h2>On this page</h2>
          <ol>
            <li><a href="#short-version">The short version</a></li>
            <li><a href="#data">What we collect</a></li>
            <li><a href="#purposes">What we use it for</a></li>
            <li><a href="#children">Students under 18</a></li>
            <li><a href="#cookies">Cookies and browser storage</a></li>
            <li><a href="#sharing">Who else handles your data</a></li>
            <li><a href="#retention">How long we keep it</a></li>
            <li><a href="#rights">Your rights and how to use them</a></li>
            <li><a href="#breach">Security and data breaches</a></li>
            <li><a href="#grievance">Questions and complaints</a></li>
            <li><a href="#changes">Changes to this policy</a></li>
            <li><a href="#sources">The law we follow</a></li>
          </ol>
        </nav>

        <section id="short-version" aria-labelledby="pp-short">
          <h2 id="pp-short">1. The short version</h2>
          <ul>
            <li>We collect only what we need to run your practice tests: your name, email, a scrambled (hashed) password and your test answers.</li>
            <li>We ask for your consent when you create an account. If you are under 18, your parent or guardian must agree too.</li>
            <li>We don’t sell your data, show ads, or track you on other websites. We use only the cookies needed to keep you signed in.</li>
            <li>You can ask to see, correct or delete your data at any time by emailing <a href={`mailto:${mail}`}>{mail}</a>.</li>
          </ul>
          <p>
            OurMocks is an independent website for Class 12 students preparing for CUET UG, IISER IAT, NISER NEST
            and COMEDK UGET. Under India’s Digital Personal Data Protection Act, 2023, we are the “Data Fiduciary” for
            the personal data described here, and you are the “Data Principal”. If you are under 18, your parent or
            guardian is a Data Principal for your data too.
          </p>
        </section>

        <section id="data" aria-labelledby="pp-data">
          <h2 id="pp-data">2. What we collect</h2>
          <dl className="legal-list">
            <div>
              <dt>Student account</dt>
              <dd>
                Your name, email address and password. We never store the password itself, only a one-way scrambled
                version (an scrypt hash). We also record when the account was created and updated.
              </dd>
            </div>
            <div>
              <dt>Your age choice and consent</dt>
              <dd>
                When you sign up you tell us whether you are 18 or older, or under 18 with a parent or guardian’s
                agreement. We save that choice, the version of this policy you agreed to and the time. If you are
                under 18 we also save your parent or guardian’s email address with it.
              </dd>
            </div>
            <div>
              <dt>Sign-in sessions</dt>
              <dd>
                Each time you sign in we create a session: a random token (we store only a scrambled copy), when it
                started, when it ends and whether you signed out.
              </dd>
            </div>
            <div>
              <dt>Guest sessions</dt>
              <dd>
                If you choose “Continue as guest”, we create a temporary account with a random made-up address (ending
                in guest.ourmocks.invalid) and the name “Guest student”. We ask for no name or email. Your test
                answers are linked to that guest account. If you later create a full account from the guest session,
                those tests move to it.
              </dd>
            </div>
            <div>
              <dt>Tests you take</dt>
              <dd>
                Your answers, questions you marked for review, start and submit times, your score and the
                section-wise and topic-wise analysis we build from them. During a test we also record, for each
                question, the time you spent on it, how many times you opened it, your first choice and how many
                times you changed your answer. This is used only to build your own analysis (for example, “you
                changed 3 right answers to wrong ones”).
              </dd>
            </div>
            <div id="waitlist-data">
              <dt>Waitlist</dt>
              <dd>
                If you join a waitlist we keep your email, the series you chose, which page you signed up from, and
                the date. Nothing else.
              </dd>
            </div>
            <div>
              <dt>Predictor and calculator tools</dt>
              <dd>
                When you use a tool such as a score or college predictor, we may save the numbers and choices you
                enter (for example your expected score and category) without your name or email, to improve the
                tools. We save an email address with them only if you ask us to send you something and give consent
                (as an adult, or with a parent or guardian’s agreement if you are under 18).
              </dd>
            </div>
            <div>
              <dt>Security records</dt>
              <dd>
                An activity log of important events such as sign-ups, sign-ins, failed sign-ins and staff changes to
                tests. Failed sign-ins are logged against a scrambled form of the email, not the email itself. To
                stop abuse we count requests per network address, but we store only a scrambled form of the address,
                never the address itself.
              </dd>
            </div>
            <div>
              <dt>Staff accounts</dt>
              <dd>
                The name, email, role, password hash and sessions of people who write and review our questions, plus
                a log of what they changed.
              </dd>
            </div>
            <div>
              <dt>Payments (not open yet)</dt>
              <dd>
                Paid test series are not on sale yet. When they open, we will keep your name, email, phone number (if
                you give it), what you bought, the amount and the payment status and reference. Card, UPI and bank
                details go straight to our payment provider; we never see or store them.
              </dd>
            </div>
          </dl>
          <p>
            We do not collect your location, phone contacts, photos, school records, Aadhaar or other ID numbers,
            and we do not use advertising or social-media tracking tools.
          </p>
        </section>

        <section id="purposes" aria-labelledby="pp-purposes">
          <h2 id="pp-purposes">3. What we use it for, and on what basis</h2>
          <p>We use your data only for these purposes:</p>
          <ul>
            <li>to create your account, sign you in and keep it secure;</li>
            <li>to run your tests, save your answers as you go, score them with the exam’s marking scheme and show you your results, solutions and analysis;</li>
            <li>to tell waitlist members when the series they chose opens;</li>
            <li>to answer your questions, requests and complaints;</li>
            <li>to prevent abuse, investigate problems and keep the records the law asks us to keep;</li>
            <li>once payments open, to take payment, give you access to what you bought and handle refunds;</li>
            <li>to improve our questions and tools using totals across many students (for example, “40% of students got question 12 wrong”), never to profile you.</li>
          </ul>
          <p>
            Our basis is your consent, given when you sign up, join a waitlist or ask a tool to email you
            (section 6 of the Act). You can withdraw consent as easily as you gave it: email us and we will stop
            and delete the data, except anything we must keep by law (see <a href="#retention">section 7</a>).
            Withdrawing consent for your account means we close the account, because we cannot run your tests
            without it. Records kept for security and legal duties are processed because the law requires them
            (section 7 of the Act).
          </p>
          <p>
            We will not use your data for advertising, sell it, or rent it to anyone. We do not make automated
            decisions about you; scores and predictions are practice estimates only.
          </p>
        </section>

        <section id="children" aria-labelledby="pp-children">
          <h2 id="pp-children">4. Students under 18</h2>
          <p>
            Most of our students are 16 to 18. Under the law, anyone under 18 is a child, and we need the
            agreement of a parent or lawful guardian before we process a child’s personal data (section 9 of the
            Act and rule 10 of the DPDP Rules, 2025).
          </p>
          <ul>
            <li>When you sign up, you must choose either “I am 18 or older” or “I am under 18, and my parent or guardian agrees to this account”. If you are under 18, you must also give your parent or guardian’s email address.</li>
            <li>We record that choice, the parent or guardian’s email, this policy’s version and the time.</li>
            <li>
              <strong>What we do not do yet:</strong> the law asks for consent that can be verified. Today, the
              parent’s agreement is a statement made on the sign-up form; we have not yet confirmed it with the
              parent directly, because our site does not send email yet. When it does, we plan to email the parent
              or guardian to confirm, and to close accounts that are not confirmed. Until then, if you are a parent
              and did not agree, email <a href={`mailto:${mail}`}>{mail}</a> and we will close the account and
              delete its data.
            </li>
            <li>A parent or guardian can ask to see, correct or delete their child’s data in the same way as the student can.</li>
            <li>We do not show advertising to anyone, and we do not track children across websites or build profiles of them. Time spent per question is used only inside the student’s own test analysis.</li>
            <li>Guest sessions collect no name or email. Students under 18 should still ask a parent before using them.</li>
          </ul>
        </section>

        <section id="cookies" aria-labelledby="pp-cookies">
          <h2 id="pp-cookies">5. Cookies and browser storage</h2>
          <p>We use only cookies that the site needs to work. There are no advertising or analytics cookies, so there is no cookie banner to accept.</p>
          <dl className="legal-list">
            <div>
              <dt>ourmocks_student</dt>
              <dd>Keeps a student signed in. Lasts up to 30 days, or until you sign out.</dd>
            </div>
            <div>
              <dt>ourmocks_admin</dt>
              <dd>Keeps a staff member signed in to the admin area. Lasts up to 8 hours.</dd>
            </div>
            <div>
              <dt>ourmocks_oauth_state</dt>
              <dd>A short-lived security check used only during a “Sign in with Google” step, to stop forged sign-ins. Deleted when the step ends.</dd>
            </div>
            <div>
              <dt>Session storage</dt>
              <dd>During a test your browser remembers which questions you have opened. It is cleared when you close the tab.</dd>
            </div>
          </dl>
        </section>

        <section id="sharing" aria-labelledby="pp-sharing">
          <h2 id="pp-sharing">6. Who else handles your data</h2>
          <p>
            We do not sell or share your data with other companies for their own use. We use a small number of
            service providers (“Data Processors”) who handle data only on our instructions:
          </p>
          <ul>
            <li><strong>Vercel</strong> hosts the website. Like any web host, it handles every request to the site, including your network (IP) address, and keeps short technical logs.</li>
            <li><strong>A managed database provider</strong> stores the database that holds the data in section 2.</li>
            <li><strong>Razorpay</strong> will process payments once paid series open. Razorpay handles your payment details under its own legal duties.</li>
            <li><strong>An email delivery service</strong> will send account and waitlist emails once we start sending email.</li>
          </ul>
          <p>
            Some of these providers may store data on servers outside India. The Act allows this except to
            countries the Government restricts (section 16), and we will follow any such restriction. A small
            number of OurMocks staff can see account and test records when they need to, for example to answer
            your request or fix a problem. We will share data with the police, courts or regulators only when
            Indian law requires it.
          </p>
        </section>

        <section id="retention" aria-labelledby="pp-retention">
          <h2 id="pp-retention">7. How long we keep it</h2>
          <p>
            We keep data only as long as we need it for the purpose you gave it for. These are our periods. The law
            sets a minimum of one year for security logs; the other periods are our own choices.
          </p>
          <dl className="legal-list">
            <div>
              <dt>Student account and test history</dt>
              <dd>While your account is in use. If you have not signed in for 2 years, we delete the account and its tests. Once we send email, we will warn you at least 48 hours before.</dd>
            </div>
            <div>
              <dt>Guest accounts</dt>
              <dd>Deleted, with their tests, 90 days after last use, unless turned into a full account.</dd>
            </div>
            <div>
              <dt>After you ask us to delete your account</dt>
              <dd>Your name, email, password hash and test answers are deleted within 30 days. Your consent record and the security log entries about your account are kept for one year and then deleted, because the DPDP Rules require logs to be kept for at least a year (rules 6 and 8).</dd>
            </div>
            <div>
              <dt>Sign-in sessions and security logs</dt>
              <dd>One year, then deleted.</dd>
            </div>
            <div>
              <dt>Waitlist emails</dt>
              <dd>Until we have told you the series you chose has opened, or 18 months after you joined, whichever is first. Removed sooner if you ask.</dd>
            </div>
            <div>
              <dt>Tool inputs</dt>
              <dd>Inputs saved without an email are kept for up to 2 years. An email saved with them is deleted once we have sent what you asked for, and within 12 months at most.</dd>
            </div>
            <div>
              <dt>Payment records (once payments open)</dt>
              <dd>As long as Indian tax and accounting law requires.</dd>
            </div>
          </dl>
        </section>

        <section id="rights" aria-labelledby="pp-rights">
          <h2 id="pp-rights">8. Your rights and how to use them</h2>
          <p>Under sections 11 to 14 of the Act, you (and, for a student under 18, a parent or guardian) can:</p>
          <ul>
            <li><strong>Access:</strong> get a summary of the personal data we hold about you, what we do with it, and who we have shared it with.</li>
            <li><strong>Correct or update:</strong> fix your name or email, or anything else that is wrong or incomplete.</li>
            <li><strong>Erase:</strong> have your account and data deleted, except what the law makes us keep.</li>
            <li><strong>Withdraw consent:</strong> at any time, as easily as you gave it.</li>
            <li><strong>Nominate:</strong> name another person who can use these rights for you if you die or become unable to.</li>
            <li><strong>Complain:</strong> raise a grievance with us, and then with the Data Protection Board of India.</li>
          </ul>
          <h3>How to make a request</h3>
          <ol>
            <li>Email <a href={`mailto:${mail}`}>{mail}</a> from the email address on your account, with the subject “Data request”. If you are a parent, write from the parent or guardian email given at sign-up, and include your child’s account email.</li>
            <li>Say what you want: a copy, a correction (and the right details), deletion, withdrawal of consent, or a nomination (with the nominee’s name and email).</li>
            <li>If you used a guest session, we cannot identify it from an email. Sign in to it and convert it to a full account first, or tell us the approximate time you used it.</li>
          </ol>
          <p>
            We may ask a question to check that the request really comes from you, so that nobody else can see or
            delete your data. We will acknowledge your request within 24 hours and act on it within 7 days where
            we can; the law’s outer limit is 90 days and we will always reply well within it. Requests are free.
          </p>
        </section>

        <section id="breach" aria-labelledby="pp-breach">
          <h2 id="pp-breach">9. Security and data breaches</h2>
          <p>
            We use encrypted connections (HTTPS), hashed passwords, scrambled session tokens, sign-in rate limits,
            cross-site request checks and role-based staff access. Access to the database is restricted, and we
            keep a log of important actions.
          </p>
          <p>
            No system is perfect. If a breach ever affects your personal data, we will tell you without delay at
            the email on your account: what happened, what it may mean for you, what we are doing about it, what
            you can do to protect yourself, and who to contact. We will also report it to the Data Protection Board
            of India, with a full report within 72 hours of finding out (rule 7 of the DPDP Rules, 2025).
          </p>
        </section>

        <section id="grievance" aria-labelledby="pp-grievance">
          <h2 id="pp-grievance">10. Questions and complaints</h2>
          <div className="legal-callout">
            <p>
              <strong>{GRIEVANCE_ROLE}</strong>
              <br />
              Email: <a href={`mailto:${mail}`}>{mail}</a>
            </p>
            <p>This person answers questions about how we process your personal data and handles complaints.</p>
          </div>
          <p>
            We acknowledge complaints within 24 hours and aim to resolve them within 7 days. Data-protection
            complaints are always answered within 90 days at most. If you are not satisfied with our answer, you can
            complain to the Data Protection Board of India, which the law says you should do after first raising it
            with us (section 13). Full details are on our{" "}
            <Link href="/about#grievance">grievance page</Link>.
          </p>
        </section>

        <section id="changes" aria-labelledby="pp-changes">
          <h2 id="pp-changes">11. Changes to this policy</h2>
          <p>
            If we change this policy, we will update the version and date at the top of this page. If a change
            affects what we collect or why, we will tell signed-in students on the site (and by email once we send
            email) and ask for fresh consent where the law requires it. We will not start using your existing data
            for a new purpose without asking.
          </p>
        </section>

        <section id="sources" aria-labelledby="pp-sources">
          <h2 id="pp-sources">12. The law we follow</h2>
          <p>
            This policy is written to meet the Digital Personal Data Protection Act, 2023 and the Digital Personal
            Data Protection Rules, 2025. The Rules were published in the Gazette of India on 13 November 2025 and
            come into force in stages: most duties to data fiduciaries (notice, security, breach reporting,
            children’s consent, rights and grievance timelines) apply from 13 May 2027. We are following them now.
          </p>
          <ul>
            {LEGAL_SOURCES.map((source) => (
              <li key={source.url}>
                <a href={source.url} rel="noopener noreferrer" target="_blank">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="legal-note">Sources checked on {SOURCES_CHECKED}. This page explains our practices; it is not legal advice.</p>
        </section>
      </div>
    </main>
  );
}
