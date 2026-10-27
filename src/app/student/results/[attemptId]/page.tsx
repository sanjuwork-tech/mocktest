import { ResultView } from "@/components/student/result-view";

export default async function Page({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  return <ResultView attemptId={attemptId} />;
}
