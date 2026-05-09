"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Briefcase, MapPin, Trash2, Pencil } from "lucide-react";
import { Topbar } from "@/shared/layout/Topbar";
import { useJobs, useDeleteJob } from "@/services/queries";
import { formatRelative } from "@/shared/utils/format";
import { ROUTES } from "@/config/routes";

export function JobsPage() {
  const t = useTranslations("jobs");
  const tc = useTranslations("common");

  const { data, isLoading } = useJobs();
  const deleteJob = useDeleteJob();

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      await deleteJob.mutateAsync(id);
      toast.success(t("deleted"));
    } catch { toast.error(t("deleteFailed")); }
  };

  return (
    <div>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{t("total", { count: data?.total ?? 0 })}</p>
          <Link href={ROUTES.jobCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> {t("new")}
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">{t("noJobs")}</p>
            <p className="text-muted-foreground text-sm mt-1">{t("noJobsDesc")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.items.map((job, i) => (
              <div key={job.id}
                className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/30 transition-all animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Link href={`/dashboard/jobs/${job.id}`} className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                      {job.title}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      job.status === "open" ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : job.status === "draft" ? "bg-muted text-muted-foreground"
                      : "bg-destructive/10 text-destructive"
                    }`}>
                      {t(`status.${job.status}` as "status.draft" | "status.open" | "status.closed")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{job.department || tc("noDepartment")}</span>
                    {(job.location || job.remote_constraints) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location ?? job.remote_constraints}
                      </span>
                    )}
                    <span className={job.publish_ready ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
                      {job.publish_ready ? t("publish.ready") : t("publish.gaps", { count: job.publish_issues.length })}
                    </span>
                    <span>{formatRelative(job.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/dashboard/jobs/${job.id}`}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(job.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
