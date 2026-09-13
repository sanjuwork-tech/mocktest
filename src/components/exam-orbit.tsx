import Link from "next/link";
// Stable alternative to the previous perpetual animated exam illustration.
export function ExamOrbit() {
  return (
    <div className="opportunity-box">
      <p className="eyebrow">Your next step</p>
      <h2 className="text-3xl">Explore more possibilities.</h2>
      <p>Understand the exams, courses and official application process.</p>
      <Link className="text-link mt-4" href="/exams">
        Explore the exam guide →
      </Link>
    </div>
  );
}
