"use client";
import { Suspense } from "react";
import { CandidateSignupPage } from "@/pages-ui/candidate/CandidateSignupPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CandidateSignupPage />
    </Suspense>
  );
}
