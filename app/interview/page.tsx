import { Suspense } from "react";
import ClientInterview from "./client";

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="container py-8">Loading interview...</div>}>
      <ClientInterview />
    </Suspense>
  );
}

