import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./student.css";
import "./exam.css";
export const metadata: Metadata = {
  title: "Student practice space",
  robots: { index: false, follow: false },
};
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
