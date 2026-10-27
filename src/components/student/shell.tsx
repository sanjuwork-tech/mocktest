"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { api } from "./api";

type Student = { id: string; name: string; email: string };

const StudentContext = createContext<Student | null>(null);
export const useStudent = () => useContext(StudentContext);

/** Requires a signed-in student; otherwise sends them to sign in and back here afterwards. */
export function StudentShell({ children, examMode = false }: { children: ReactNode; examMode?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api<{ authenticated: boolean; user?: Student }>("/api/auth/session")
      .then((data) => {
        if (!active) return;
        if (data.user) return setStudent(data.user);
        const next = pathname + window.location.search;
        router.replace(`/student/login?next=${encodeURIComponent(next)}`);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "Could not open your practice space.");
      });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  const signOut = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/student/login");
  };

  if (!student)
    return (
      <main id="main-content" className="page-shell student-main">
        {error ? (
          <p className="student-warning" role="alert">
            {error} <button className="student-text-button" onClick={() => window.location.reload()}>Try again</button>
          </p>
        ) : (
          <p role="status">Opening your practice space…</p>
        )}
      </main>
    );

  return (
    <StudentContext.Provider value={student}>
      <main
        id="main-content"
        tabIndex={-1}
        className={`page-shell student-main${examMode ? " exam-mode" : ""}`}
        data-exam-mode={examMode || undefined}
      >
        {!examMode && (
          <div className="student-topbar">
            <Link href="/student" className="text-link">
              <ArrowLeft size={16} /> My practice space
            </Link>
            <div className="student-account">
              <span className="student-avatar" aria-hidden="true">
                {student.name.charAt(0).toUpperCase()}
              </span>
              <span className="student-account-name">
                <strong>{student.name}</strong>
                <small>{student.email}</small>
              </span>
              <button onClick={signOut} className="student-icon-button">
                <LogOut size={16} aria-hidden="true" /> Sign out
              </button>
            </div>
          </div>
        )}
        {children}
      </main>
    </StudentContext.Provider>
  );
}
