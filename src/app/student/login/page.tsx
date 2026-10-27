import { Suspense } from "react";
import { StudentAuthForm } from "@/components/student/auth-form";

export default function Page() {
  return (
    <Suspense>
      <StudentAuthForm />
    </Suspense>
  );
}
