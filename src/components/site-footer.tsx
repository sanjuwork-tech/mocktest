import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell">
        <div className="footer-grid">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-7 text-navy/80">
              Your dream deserves a path of its own. Discover more exams,
              explore our mock series, and prepare for the future you choose.
            </p>
          </div>
          <div>
            <h2>Explore</h2>
            {[
              ["Free Full-Length Tests", "/free-diagnostic"],
              ["All exam details", "/exams"],
              ["Test series catalog", "/test-series"],
              ["Compare all 4 exams", "/exams/compare"],
              ["Eligibility checker", "/exams/eligibility"],
              ["What exams after 12th?", "/exams/after-class-12"],
            ].map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h2>OurMocks</h2>
            <Link href="/about">Our purpose & Team</Link>
            <Link href="/about#grievance">Grievance & Support</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/admin">Admin sign in</Link>
          </div>
        </div>
        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,0.06)", fontSize: "11px", color: "#64748b", lineHeight: 1.6 }}>
          <p style={{ margin: "0 0 8px 0" }}>
            <strong>Institutional Disclaimer:</strong> OurMocks is an independent educational preparation and mock test platform. OurMocks is not affiliated with, endorsed by, or sponsored by the National Testing Agency (NTA), the Joint Admissions Committee (IISERs), NISER Bhubaneswar, UM-DAE CEBS, or COMEDK Karnataka. All exam names, logos, and trademarks belong to their respective authorities. Score and rank diagnostics provided on this platform are statistical practice benchmarks and do not constitute admission guarantees.
          </p>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} OurMocks</span>
          <span>Independent practice platform · Not an exam conducting authority</span>
        </div>
      </div>
    </footer>
  );
}
