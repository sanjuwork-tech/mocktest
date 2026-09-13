import { notFound, permanentRedirect } from "next/navigation";
import { exams } from "@/data/exams";
export const dynamicParams = false;
export function generateStaticParams() {
  return exams.map((exam) => ({ slug: exam.slug }));
}
export default async function ExamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!exams.some((exam) => exam.slug === slug)) notFound();
  permanentRedirect(`/exams#${slug}`);
}
