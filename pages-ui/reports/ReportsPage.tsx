"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Clock,
  TrendingUp,
  Globe,
  Users,
  CheckCircle2,
  Percent,
  Briefcase,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";

import { Topbar } from "@/shared/layout/Topbar";
import {
  useTimeToHireReport,
  usePipelineReport,
  useSourcesReport,
  useOverviewReport,
  useApplicationsOverTime,
  useApplicationsByJob,
} from "@/services/queries/tasks-reports.queries";

const DAY_OPTIONS = [
  { value: 30, label: "last30" },
  { value: 60, label: "last60" },
  { value: 90, label: "last90" },
] as const;

// Theme-aware palette. Primary follows the CSS var (amber, adapts to dark/
// light); the rest are fixed hues for categorical series.
const PRIMARY = "hsl(var(--primary))";
const PALETTE = ["hsl(var(--primary))", "#3b82f6", "#14b8a6", "#a855f7", "#ec4899", "#f59e0b", "#10b981"];

// ── Shared chrome ─────────────────────────────────────────────────────────

function Card({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-border rounded-xl p-6 ${className}`}>
      <h2 className="font-display font-semibold text-foreground flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-primary" /> {title}
      </h2>
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

// Custom tooltip styled to match the card surface (recharts default is white).
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs">
      {label != null && <p className="font-medium text-foreground mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          <span className="font-semibold text-foreground">{p.value}</span> {p.name}
        </p>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-muted-foreground text-sm py-8 text-center">{text}</p>;
}

function ChartSkeleton({ height = 260 }: { height?: number }) {
  return <div className="bg-muted/30 rounded-lg animate-pulse" style={{ height }} />;
}

export function ReportsPage() {
  const t = useTranslations("reports");
  const [days, setDays] = useState(30);

  const { data: overview, isLoading: ovLoading } = useOverviewReport(days);
  const { data: overTime, isLoading: otLoading } = useApplicationsOverTime(days);
  const { data: timeToHire } = useTimeToHireReport(days);
  const { data: pipeline, isLoading: pipeLoading } = usePipelineReport(days);
  const { data: byJob, isLoading: jobLoading } = useApplicationsByJob(days);
  const { data: sources, isLoading: srcLoading } = useSourcesReport(days);

  // Short label for the time axis: "DD.MM".
  const fmtDay = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const overTimeData = (overTime?.points ?? []).map((p) => ({
    date: fmtDay(p.date),
    [t("applications")]: p.count,
  }));

  const funnelData = (pipeline?.stages ?? []).map((s, i) => ({
    name: s.stage_name,
    value: s.count,
    fill: PALETTE[i % PALETTE.length],
  }));

  const byJobData = (byJob?.jobs ?? []).map((j) => ({
    name: j.job_title,
    [t("applications")]: j.count,
  }));

  const sourcesData = (sources?.sources ?? []).map((s) => ({
    name: s.source,
    value: s.count,
  }));

  return (
    <div>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-6">
        {/* Date range */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("dateRange")}:</span>
          <div className="flex gap-1 bg-muted/40 rounded-lg p-1">
            {DAY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setDays(value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  days === value ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(label as "last30" | "last60" | "last90")}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI overview ─────────────────────────────────────────────── */}
        {ovLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiCard label={t("totalApplications")} value={overview?.total_applications ?? 0} icon={Users} color="bg-blue-500/10 text-blue-500" />
            <KpiCard label={t("totalHired")} value={overview?.total_hired ?? 0} icon={CheckCircle2} color="bg-green-500/10 text-green-500" />
            <KpiCard label={t("hireRate")} value={`${overview?.hire_rate ?? 0}%`} icon={Percent} color="bg-purple-500/10 text-purple-500" />
            <KpiCard label={t("avgTimeToHire")} value={`${overview?.avg_time_to_hire_days ?? 0} ${t("days")}`} icon={CalendarDays} color="bg-amber-500/10 text-amber-500" />
            <KpiCard label={t("activeJobs")} value={overview?.active_jobs ?? 0} icon={Briefcase} color="bg-primary/10 text-primary" />
          </div>
        )}

        {/* ── Applications over time ────────────────────────────────────── */}
        <Card title={t("applicationsOverTime")} icon={TrendingUp}>
          {otLoading ? (
            <ChartSkeleton />
          ) : overTimeData.length === 0 ? (
            <Empty text={t("noData")} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={overTimeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="appArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey={t("applications")} stroke={PRIMARY} strokeWidth={2} fill="url(#appArea)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* ── Funnel + Sources ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={t("conversionFunnel")} icon={TrendingUp}>
            {pipeLoading ? (
              <ChartSkeleton />
            ) : funnelData.length === 0 ? (
              <Empty text={t("noData")} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <FunnelChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="name" fontSize={12} />
                    <LabelList position="center" fill="#fff" stroke="none" dataKey="value" fontSize={13} fontWeight={600} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card title={t("sources")} icon={Globe}>
            {srcLoading ? (
              <ChartSkeleton />
            ) : sourcesData.length === 0 ? (
              <Empty text={t("noData")} />
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Tooltip content={<ChartTooltip />} />
                    <Pie data={sourcesData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {sourcesData.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <ul className="flex-1 space-y-2 text-sm">
                  {sources?.sources.map((s, i) => (
                    <li key={s.source} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                      <span className="text-foreground truncate flex-1">{s.source}</span>
                      <span className="text-muted-foreground text-xs">{s.count} ({s.percentage}%)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        {/* ── Applications by job ───────────────────────────────────────── */}
        <Card title={t("applicationsByJob")} icon={BarChart3}>
          {jobLoading ? (
            <ChartSkeleton />
          ) : byJobData.length === 0 ? (
            <Empty text={t("noData")} />
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, byJobData.length * 44)}>
              <BarChart data={byJobData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
                <Bar dataKey={t("applications")} fill={PRIMARY} radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* ── Time to hire (compact stats) ──────────────────────────────── */}
        <Card title={t("timeToHire")} icon={Clock}>
          {timeToHire?.total_hired === 0 ? (
            <Empty text={t("noData")} />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{timeToHire?.avg_days ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("avg")} ({t("days")})</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{timeToHire?.min_days ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("min")} ({t("days")})</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{timeToHire?.max_days ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("max")} ({t("days")})</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
