"use client";

import { Topbar } from "@/shared/layout/Topbar";
import { CreateJobWizard } from "@/features/jobs/components/wizard/CreateJobWizard";

export function CreateJobPage() {
  return (
    <div>
      <Topbar />
      <CreateJobWizard mode="create" />
    </div>
  );
}
