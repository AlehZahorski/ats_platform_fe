"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Briefcase,
  Users,
  GitBranch,
  TrendingUp,
  ClipboardList,
  CheckSquare,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Topbar } from "@/shared/layout/Topbar";
import { useApplications, useJobs } from "@/services/queries";
import { usePipelineReport, useTasks } from "@/services/queries/tasks-reports.queries";
import { ROUTES } from "@/config/routes";

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

// Terminal pipeline stages — matched by name so the heuristic survives custom
// stage labels in either language. "Active pipeline" = everything that isn't
// terminal; "hired" feeds its own card.
const HIRED_RE = /(hired|zatrud)/i;
const REJECTED_RE = /(reject|odrzuc)/i;

export function DashboardPage() {
  const t = useTranslations("dashboard");
  const tj = useTranslations("jobs");
  const tc = useTranslations("common");

  const { data: jobsData } = useJobs();
  const { data: appsData } = useApplications();
  // Map job id → title so the application rows can show which offer they're for
  // (ApplicationListItem only carries job_id, not the title).
  const jobTitleById = new Map((jobsData?.items ?? []).map((j) => [j.id, j.title]));
  // 365-day window = effectively "all current applicants" for the funnel counts.
  const { data: pipeline } = usePipelineReport(365);
  const { data: tasks } = useTasks();

  const openJobs = jobsData?.items.filter((job) => job.status === "open").length ?? 0;
  const totalApps = appsData?.total ?? 0;

  // Pipeline counts derived from the per-stage report.
  const stages = pipeline?.stages ?? [];
  const hiredCount = stages
    .filter((s) => HIRED_RE.test(s.stage_name))
    .reduce((sum, s) => sum + s.count, 0);
  const activePipeline = stages
    .filter((s) => !HIRED_RE.test(s.stage_name) && !REJECTED_RE.test(s.stage_name))
    .reduce((sum, s) => sum + s.count, 0);

  // Newest applications first — top 5 for the "needs action" column.
  const recentApps = [...(appsData?.items ?? [])]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 5);

  // Open tasks (not completed), soonest due first; tasks without a due date
  // sink to the bottom. Top 5.
  const openTasks = [...(tasks ?? [])]
    .filter((task) => !task.completed)
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return +new Date(a.due_date) - +new Date(b.due_date);
    })
    .slice(0, 5);

  const now = Date.now();

  return (
    <div>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-6">
        {/* ── Stat cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t("openJobs")} value={openJobs} icon={Briefcase} color="bg-primary/10 text-primary" />
          <StatCard title={t("totalApplications")} value={totalApps} icon={Users} color="bg-blue-500/10 text-blue-500" />
          <StatCard title={t("activePipeline")} value={activePipeline} icon={GitBranch} color="bg-green-500/10 text-green-500" />
          <StatCard title={t("hiredThisMonth")} value={hiredCount} icon={TrendingUp} color="bg-purple-500/10 text-purple-500" />
        </div>

        {/* ── Needs action ────────────────────────────────────────────── */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            {t("needsAction")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* New applications */}
            <ActionPanel
              title={t("newApplications")}
              icon={ClipboardList}
              href={ROUTES.applications}
              viewAllLabel={t("viewAll")}
              empty={recentApps.length === 0 ? t("noNewApplications") : null}
            >
              {recentApps.map((app) => (
                <Link
                  key={app.id}
                  href={ROUTES.application(app.id)}
                  className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0 hover:bg-accent/30 -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {`${app.first_name} ${app.last_name}`.trim()}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t("appliedFor")} {jobTitleById.get(app.job_id) ?? tc("noDepartment")}
                    </p>
                  </div>
                  {app.stage?.name && (
                    <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      {app.stage.name}
                    </span>
                  )}
                </Link>
              ))}
            </ActionPanel>

            {/* Open tasks */}
            <ActionPanel
              title={t("openTasks")}
              icon={CheckSquare}
              href={ROUTES.tasks}
              viewAllLabel={t("viewAll")}
              empty={openTasks.length === 0 ? t("noOpenTasks") : null}
            >
              {openTasks.map((task) => {
                const overdue = task.due_date ? +new Date(task.due_date) < now : false;
                return (
                  <Link
                    key={task.id}
                    href={ROUTES.tasks}
                    className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0 hover:bg-accent/30 -mx-2 px-2 rounded-md transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground truncate min-w-0">{task.title}</p>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 text-xs ${
                        overdue ? "text-destructive font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {overdue && <AlertTriangle className="w-3 h-3" />}
                      {task.due_date
                        ? overdue
                          ? t("overdue")
                          : new Date(task.due_date).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })
                        : t("noDueDate")}
                    </span>
                  </Link>
                );
              })}
            </ActionPanel>
          </div>
        </div>

        {/* ── Recent jobs ─────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in-delay-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{t("recentJobs")}</h2>
            <Link
              href={ROUTES.jobs}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {t("viewAll")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {jobsData?.items.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noJobs")}</p>
          ) : (
            <div className="space-y-3">
              {jobsData?.items.slice(0, 5).map((job) => (
                <Link
                  key={job.id}
                  href={ROUTES.job(job.id)}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-accent/30 -mx-2 px-2 rounded-md transition-colors"
                >
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionPanel({
  title,
  icon: Icon,
  href,
  viewAllLabel,
  empty,
  children,
}: {
  title: string;
  icon: React.ElementType;
  href: string;
  viewAllLabel: string;
  empty: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in-delay-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="w-4 h-4 text-muted-foreground" />
          {title}
        </h3>
        <Link href={href} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          {viewAllLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {empty ? <p className="text-sm text-muted-foreground py-2">{empty}</p> : <div>{children}</div>}
    </div>
  );
}
