"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Topbar } from "@/components/layout/Topbar";
import {
  useTimeToHireReport,
  usePipelineReport,
  useSourcesReport,
} from "@/services/queries/tasks-reports.queries";
import { BarChart2, Clock, TrendingUp, Globe } from "lucide-react";

const DAY_OPTIONS = [
  { value: 30, label: "last30" },
  { value: 60, label: "last60" },
  { value: 90, label: "last90" },
] as const;

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Bar ─────────────────────────────────────────────────────────────────────
function Bar({ label, count, percentage, color = "bg-primary" }: {
  label: string; count: number; percentage: number; color?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium truncate max-w-[60%]">{label}</span>
        <span className="text-muted-foreground text-xs">{count} ({percentage}%)</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
}

const SOURCE_COLORS = [
  "bg-primary", "bg-blue-500", "bg-teal-500",
  "bg-amber-500", "bg-purple-500", "bg-pink-500",
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const t = useTranslations("reports");
  const [days, setDays] = useState(30);

  const { data: timeToHire, isLoading: tthLoading } = useTimeToHireReport(days);
  const { data: pipeline, isLoading: pipeLoading } = usePipelineReport(days);
  const { data: sources, isLoading: srcLoading } = useSourcesReport(days);

  return (
    <div>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-6">
        {/* Date range filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("dateRange")}:</span>
          <div className="flex gap-1 bg-muted/40 rounded-lg p-1">
            {DAY_OPTIONS.map(({ value, label }) => (
              <button key={value} onClick={() => setDays(value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  days === value ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {t(label as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Time to hire */}
        <div>
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary" /> {t("timeToHire")}
          </h2>
          {tthLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />)}
            </div>
          ) : timeToHire?.total_hired === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noData")}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label={`Avg ${t("avgDays")}`} value={timeToHire?.avg_days ?? 0} sub="days to hire" />
              <StatCard label={`Min ${t("avgDays")}`} value={timeToHire?.min_days ?? 0} />
              <StatCard label={`Max ${t("avgDays")}`} value={timeToHire?.max_days ?? 0} />
              <StatCard label={t("candidates")} value={timeToHire?.total_hired ?? 0} sub="hired" />
            </div>
          )}
        </div>

        {/* Pipeline funnel */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-primary" /> {t("pipeline")}
          </h2>
          {pipeLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-muted/40 rounded animate-pulse" />)}
            </div>
          ) : pipeline?.stages.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noData")}</p>
          ) : (
            <div className="space-y-4">
              {pipeline?.stages.map((stage) => (
                <Bar
                  key={stage.stage_name}
                  label={stage.stage_name}
                  count={stage.count}
                  percentage={stage.percentage}
                />
              ))}
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                Total: {pipeline?.total} {t("candidates")}
              </p>
            </div>
          )}
        </div>

        {/* Application sources */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-primary" /> {t("sources")}
          </h2>
          {srcLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-muted/40 rounded animate-pulse" />)}
            </div>
          ) : sources?.sources.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noData")}</p>
          ) : (
            <div className="space-y-4">
              {sources?.sources.map((src, i) => (
                <Bar
                  key={src.source}
                  label={src.source}
                  count={src.count}
                  percentage={src.percentage}
                  color={SOURCE_COLORS[i % SOURCE_COLORS.length]}
                />
              ))}
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                Total: {sources?.total} {t("candidates")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}