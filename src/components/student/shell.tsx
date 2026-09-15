"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, LogOut, Sparkles, CheckCircle2 } from "lucide-react";
import {
  signIn,
  signOut,
  storageWarning,
  useDemo,
  useReady,
} from "@/lib/student/store";

type StudentInfo = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  provider: string;
  isGuest?: boolean;
};

export function StudentShell({ children }: { children: ReactNode }) {
  const s = useDemo();
  const ready = useReady();
  const router = useRouter();
  const [serverStudent, setServerStudent] = useState<StudentInfo | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkServerSession() {
      try {
        const res = await fetch("/api/student/me");
        if (res.ok) {
          const data = await res.json();
          if (active && data.student) {
            setServerStudent(data.student);
            if (!s.signedIn) signIn();
          }
        }
      } catch {
        // Fallback to client state
      } finally {
        if (active) setCheckedAuth(true);
      }
    }
    checkServerSession();
    return () => {
      active = false;
    };
  }, [s.signedIn]);

  useEffect(() => {
    if (ready && checkedAuth && !s.signedIn && !serverStudent) {
      router.replace("/student/login");
    }
  }, [ready, checkedAuth, s.signedIn, serverStudent, router]);

  if (!ready || (!checkedAuth && !s.signedIn)) {
    return (
      <main id="main-content" className="page-shell student-main">
        <p role="status">Opening your practice space…</p>
        <Link href="/student/login">Student demo login</Link>
      </main>
    );
  }

  const studentName = serverStudent?.name || "Demo student";
  const initials = studentName.charAt(0).toUpperCase() || "S";
  const isGuest = serverStudent?.isGuest ?? true;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    signOut();
    router.push("/student/login");
  };

  return (
    <main id="main-content" tabIndex={-1} className="page-shell student-main">
      <div className="student-topbar">
        <Link href="/student" className="text-link">
          <ArrowLeft size={16} /> My practice space
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {serverStudent?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={serverStudent.avatarUrl}
              alt={studentName}
              className="student-avatar"
              style={{ width: "32px", height: "32px", borderRadius: "50%" }}
            />
          ) : (
            <span className="student-avatar">{initials}</span>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--navy)" }}>
              {studentName}
            </span>
            <span style={{ fontSize: "11px", color: "#6b7c96" }}>
              {isGuest ? "Guest Preview" : "Google Account"}
            </span>
          </div>
          <button onClick={handleLogout} className="student-icon-button" title="Sign out">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      <p className="demo-ribbon">
        {isGuest ? (
          <>
            <Sparkles size={16} /> Guest preview · Free Diagnostic Mocks active ·{" "}
            <Link href="/student/login" style={{ textDecoration: "underline", color: "inherit" }}>
              Sign in with Google
            </Link>{" "}
            to sync attempts across devices
          </>
        ) : (
          <>
            <CheckCircle2 size={16} style={{ color: "var(--blue)" }} /> Verified Student Space ·
            Real-time autosave with local offline resilience
          </>
        )}
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
