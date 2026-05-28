"use client";
import { Suspense } from "react";
import { CandidateLoginPage } from "@/pages-ui/candidate/CandidateLoginPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CandidateLoginPage />
    </Suspense>
  );
}
