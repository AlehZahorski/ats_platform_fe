"use client";

import { useTranslations } from "next-intl";

import { Topbar } from "@/shared/layout/Topbar";
import { useJob } from "@/services/queries";
import { CreateJobWizard } from "@/features/jobs/components/wizard/CreateJobWizard";
import { JobTabs } from "@/features/jobs/components/JobTabs";

interface JobEditPageProps {
  jobId: string;
}

export function JobEditPage({ jobId }: JobEditPageProps) {
  const t = useTranslations("jobs");
  const { data: job, isLoading } = useJob(jobId);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-64 rounded-xl border border-border bg-card animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return <div className="p-6 text-muted-foreground">{t("notFound")}</div>;
  }

  return (
    <div>
      <Topbar title={job.title} />
      <JobTabs jobId={jobId} />
      <CreateJobWizard mode="edit" jobId={jobId} />
    </div>
  );
}
