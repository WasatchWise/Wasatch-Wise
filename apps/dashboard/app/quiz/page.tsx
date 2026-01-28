import { Suspense } from "react";
import { QuizPageClient } from "@/components/quiz/QuizPageClient";

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <QuizPageClient />
    </Suspense>
  );
}
