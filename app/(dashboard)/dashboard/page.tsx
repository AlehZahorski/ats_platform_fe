"use client";

import { useTranslations } from "next-intl";
import { Briefcase, Users, GitBranch, TrendingUp } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useApplications, useJobs } from "@/services/queries";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tj = useTranslations("jobs");
  const tc = useTranslations("common");
  const { data: jobsData } = useJobs();
  const { data: appsData } = useApplications();

  const openJobs = jobsData?.items.filter((job) => job.status === "open").length ?? 0;
  const totalApps = appsData?.total ?? 0;

  return (
    <div>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t("openJobs")} value={openJobs} icon={Briefcase} color="bg-primary/10 text-primary" />
          <StatCard title={t("totalApplications")} value={totalApps} icon={Users} color="bg-blue-500/10 text-blue-500" />
          <StatCard title={t("activePipeline")} value="—" icon={GitBranch} color="bg-green-500/10 text-green-500" />
          <StatCard title={t("hiredThisMonth")} value="—" icon={TrendingUp} color="bg-purple-500/10 text-purple-500" />
        </div>

        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in-delay-1">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">{t("recentJobs")}</h2>
          {jobsData?.items.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noJobs")}</p>
          ) : (
            <div className="space-y-3">
              {jobsData?.items.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.department ?? tc("noDepartment")}</p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      job.status === "open"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : job.status === "draft"
                          ? "bg-muted text-muted-foreground"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {tj(`status.${job.status}` as "status.draft" | "status.open" | "status.closed")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
