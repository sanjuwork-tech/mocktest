import { TestIntro } from "@/components/student/test-intro";

export default async function Page({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  return <TestIntro testId={testId} />;
}
