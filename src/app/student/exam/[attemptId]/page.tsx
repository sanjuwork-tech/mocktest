import { ExamPlayer } from "@/components/student/exam-player";

export default async function Page({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  return <ExamPlayer attemptId={attemptId} />;
}
