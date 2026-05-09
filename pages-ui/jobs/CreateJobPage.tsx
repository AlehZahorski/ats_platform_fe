"use client";

import { Topbar } from "@/shared/layout/Topbar";
import { JobWizard } from "@/features/jobs/components/JobWizard";

export function CreateJobPage() {
  return (
    <div>
      <Topbar title="Nowa oferta pracy" />
      <JobWizard />
    </div>
  );
}
