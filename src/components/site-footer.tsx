import Link from "next/link";
import { Logo } from "@/components/logo";
import { exams } from "@/data/exams";
import "./site-chrome.css";

const COLUMNS: { title: string; links: [label: string, href: string][] }[] = [
  {
    title: "Exams",
    links: [
      ["All exam guides", "/exams"],
      ...exams.map((exam): [string, string] => [exam.name, `/exams/${exam.slug}`]),
      ["Free Test 1", "/free-diagnostic"],
      ["Test series", "/test-series"],
    ],
  },
  {
    title: "After Class 12",
    links: [
      ["Exams after Class 12", "/exams/after-class-12"],
      ["Compare the four exams", "/exams/compare"],
      ["Eligibility checker", "/exams/eligibility"],
      ["Colleges by exam", "/colleges"],
      ["Guides", "/blog"],
    ],
  },
  {
    title: "Free tools",
    links: [
      ["All free tools", "/tools"],
      ["Score calculator", "/tools/score-calculator"],
      ["JEE Main rank predictor", "/tools/jee-main-rank-predictor"],
      ["JEE Main college predictor", "/tools/jee-main-college-predictor"],
      ["NEET rank predictor", "/tools/neet-rank-predictor"],
      ["NEET college predictor", "/tools/neet-college-predictor"],
    ],
  },
  {
    title: "About and policies",
    links: [
      ["About OurMocks", "/about"],
      ["Grievance and support", "/about#grievance"],
      ["Privacy Policy", "/privacy"],
      ["Terms of Service", "/terms"],
      ["Refund and Cancellation Policy", "/refund-policy"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell">
        <div className="footer-grid sf-grid">
          <div>
            <Logo />
            <p className="sf-about">
              Full-length mock tests and plain-English exam guides for Class 12 students taking CUET UG, IISER IAT,
              NISER NEST and COMEDK UGET.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2>{column.title}</h2>
              {column.links.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <p className="sf-disclaimer">
          OurMocks is an independent practice platform. It is not affiliated with, endorsed by or sponsored by the
          National Testing Agency (NTA), the IISERs, NISER Bhubaneswar, UM-DAE CEBS or COMEDK. Exam names belong to
          their conducting bodies. Scores and analysis here are practice feedback; they do not decide admission.
        </p>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} OurMocks</span>
          <span>Independent practice platform · Not an exam conducting authority</span>
        </div>
      </div>
    </footer>
  );
}
