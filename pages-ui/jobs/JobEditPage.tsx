"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useApplications, useFormTemplates, useJob } from "@/services/queries";
import { Topbar } from "@/shared/layout/Topbar";
import { formatRelative } from "@/shared/utils/format";
import { JobForm } from "@/features/jobs/components/JobForm";
import { ROUTES } from "@/config/routes";
import { useJobForm } from "@/features/jobs/hooks/useJobForm";

interface JobEditPageProps {
  jobId: string;
}

export function JobEditPage({ jobId }: JobEditPageProps) {
  const t = useTranslations("jobs");
  const tc = useTranslations("common");
  const { data: job, isLoading } = useJob(jobId);
  const { data: apps } = useApplications({ job_id: jobId });
  const { data: templates } = useFormTemplates();
  const { form, handleChange, handleSave, handleTemplateChange, isSaving, isAssigning } = useJobForm(jobId, job);

  if (isLoading || !form) {
    return <div className="p-6"><div className="h-64 rounded-xl border border-border bg-card animate-pulse" /></div>;
  }

  if (!job) {
    return <div className="p-6 text-muted-foreground">{t("notFound")}</div>;
  }

  const stageName = (name: string) => {
    const map: Record<string, string> = {
      applied: tc("stageNames.applied"), screening: tc("stageNames.screening"),
      interview: tc("stageNames.interview"), offer: tc("stageNames.offer"),
      hired: tc("stageNames.hired"), rejected: tc("stageNames.rejected"),
      under_review: tc("stageNames.under_review"),
    };
    return map[name] ?? name;
  };

  return (
    <div>
      <Topbar title={job.title} />
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={ROUTES.jobs} className="hover:text-foreground">{t("title")}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{job.title}</span>
        </div>

        <JobForm
          job={job}
          form={form}
          templates={templates}
          onChange={handleChange}
          onSave={handleSave}
          onTemplateChange={handleTemplateChange}
          isSaving={isSaving}
          isAssigning={isAssigning}
        />

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            {t("applicationsTitle")} <span className="ml-1 text-sm font-normal text-muted-foreground">({apps?.total ?? 0})</span>
          </h3>
          {apps?.items.length ? (
            <div className="space-y-2">
              {apps.items.map((application) => (
                <Link
                  key={application.id}
                  href={`/dashboard/applications/${application.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:border-primary/30 hover:bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{application.first_name} {application.last_name}</p>
                    <p className="text-xs text-muted-foreground">{application.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {application.stage && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {stageName(application.stage.name)}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noApplications")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
