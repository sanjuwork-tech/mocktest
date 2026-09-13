"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChartNoAxesCombined,
  BookOpenCheck,
  Compass,
} from "lucide-react";
import { signIn } from "@/lib/student/store";
export function StudentLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <main id="main-content" tabIndex={-1} className="page-shell student-main">
      <div className="student-login-grid">
        <section className="student-welcome">
          <p className="eyebrow">A little practice. A clearer direction.</p>
          <h1>
            Your next chapter
            <br />
            starts with <em>you.</em>
          </h1>
          <p>
            You don’t need to have everything figured out. Start here, see what
            you know, and find your next small step forward.
          </p>
          <ul className="student-benefits">
            <li>
              <BookOpenCheck />
              150 questions. Three subjects. Ten formats.
            </li>
            <li>
              <ChartNoAxesCombined />
              Understand your mistakes, timing and confidence.
            </li>
            <li>
              <Compass />
              Leave every test with a focused practice plan.
            </li>
          </ul>
        </section>
        <section className="student-panel student-login-card">
          <p className="eyebrow">Welcome to your practice space</p>
          <h2>Try the student experience</h2>
          <p>
            This demo account is ready for you. No registration or payment
            needed.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              if (
                String(data.get("email")).trim().toLowerCase() !==
                  "student@mockstride.demo" ||
                data.get("password") !== "Student@123"
              ) {
                setError("Use the demo email and password shown below.");
                return;
              }
              signIn();
              router.push("/student");
            }}
          >
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                defaultValue="student@mockstride.demo"
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                defaultValue="Student@123"
              />
            </label>
            {error && (
              <p role="alert" className="student-warning">
                {error}
              </p>
            )}
            <button className="button-primary" type="submit">
              Enter my practice space <ArrowRight size={18} />
            </button>
          </form>
          <div className="demo-credentials">
            <strong>Demo credentials</strong>
            <span>student@mockstride.demo</span>
            <code>Student@123</code>
          </div>
          <p className="student-muted">
            A local interface preview with browser-only demo access. Use no
            personal information. These practice sets do not reproduce a
            particular exam’s official pattern.
          </p>
        </section>
      </div>
    </main>
  );
}
