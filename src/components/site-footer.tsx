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
              ["All exam details", "/exams"],
              ["Preparation", "/test-series"],
              ["CUET UG guide", "/exams/cuet-ug"],
              ["IISER IAT guide", "/exams/iiser-iat"],
              ["NEST guide", "/exams/niser-nest"],
              ["COMEDK guide", "/exams/comedk"],
            ].map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h2>TestDisha</h2>
            <Link href="/about">Our purpose</Link>
            <Link href="/about#information-policy">
              How we review information
            </Link>
            <Link href="/about#information-policy">Information policy</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/admin">Admin sign in</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} TestDisha</span>
          <span>Independent guide · Not an exam conducting authority</span>
        </div>
      </div>
    </footer>
  );
}
