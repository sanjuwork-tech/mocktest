import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./student.css";
export const metadata: Metadata = {
  title: "Student practice demo",
  robots: { index: false, follow: false },
};
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
