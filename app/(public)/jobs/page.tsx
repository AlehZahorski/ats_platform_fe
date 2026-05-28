"use client";
import { Suspense } from "react";
import { JobBoardPage } from "@/pages-ui/jobboard/JobBoardPage";

export default function Page() {
  // JobBoardPage uses useSearchParams which requires Suspense in Next 15.
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Ładowanie…</div>}>
      <JobBoardPage />
    </Suspense>
  );
}
