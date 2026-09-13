"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ArrowLeft, LogOut, Sparkles } from "lucide-react";
import {
  signOut,
  storageWarning,
  useDemo,
  useReady,
} from "@/lib/student/store";
export function StudentShell({ children }: { children: ReactNode }) {
  const s = useDemo();
  const ready = useReady();
  const router = useRouter();
  useEffect(() => {
    if (ready && !s.signedIn) router.replace("/student/login");
  }, [ready, s.signedIn, router]);
  if (!ready || !s.signedIn)
    return (
      <main id="main-content" className="page-shell student-main">
        <p role="status">Opening your practice space…</p>
        <Link href="/student/login">Student demo login</Link>
      </main>
    );
  return (
    <main id="main-content" tabIndex={-1} className="page-shell student-main">
      <div className="student-topbar">
        <Link href="/student" className="text-link">
          <ArrowLeft size={16} /> My practice space
        </Link>
        <div>
          <span className="student-avatar">S</span>
          <span>Demo student</span>
          <button
            onClick={() => {
              signOut();
              router.push("/student/login");
            }}
            className="student-icon-button"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
      <p className="demo-ribbon">
        <Sparkles size={16} /> Student preview · Practice examples · Progress
        saved in this browser only
      </p>
      {storageWarning() && (
        <p className="student-warning" role="alert">
          {storageWarning()}
        </p>
      )}
      {children}
    </main>
  );
}
