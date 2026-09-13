import Link from "next/link";
export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-shell py-20 min-h-[65vh]"
    >
      <p className="eyebrow">404 · Page not found</p>
      <h1 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-tight">
        Let’s find your next step.
      </h1>
      <p className="mt-5 max-w-lg text-base leading-8 text-navy/75">
        This link may have changed. Explore the exam guide to find
        opportunities, official notices and application information.
      </p>
      <Link href="/exams" className="button-primary mt-7">
        Explore exams →
      </Link>
    </main>
  );
}
