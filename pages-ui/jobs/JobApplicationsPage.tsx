"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Topbar } from "@/shared/layout/Topbar";
import { useApplications, useJob } from "@/services/queries";
import { JobTabs } from "@/features/jobs/components/JobTabs";

interface JobApplicationsPageProps {
  jobId: string;
}

export function JobApplicationsPage({ jobId }: JobApplicationsPageProps) {
  const t = useTranslations("jobs");
  const tc = useTranslations("common");

  const { data: job } = useJob(jobId);
  const { data: apps, isLoading } = useApplications({ job_id: jobId });

  const stageName = (name: string) => {
    const map: Record<string, string> = {
      applied:      tc("stageNames.applied"),
      screening:    tc("stageNames.screening"),
      interview:    tc("stageNames.interview"),
      offer:        tc("stageNames.offer"),
      hired:        tc("stageNames.hired"),
      rejected:     tc("stageNames.rejected"),
      under_review: tc("stageNames.under_review"),
    };
    return map[name] ?? name;
  };

  return (
    <div>
      <Topbar title={job?.title ?? t("loading")} />
      <JobTabs jobId={jobId} />

      <div className="p-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              {t("applicationsTitle")}
              <span className="ml-1 font-normal text-muted-foreground">
                ({apps?.total ?? 0})
              </span>
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 rounded-lg border border-border bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : apps?.items.length ? (
            <div className="space-y-2">
              {apps.items.map((application) => (
                <Link
                  key={application.id}
                  href={`/dashboard/applications/${application.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:border-primary/30 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {application.first_name} {application.last_name}
                    </p>
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
