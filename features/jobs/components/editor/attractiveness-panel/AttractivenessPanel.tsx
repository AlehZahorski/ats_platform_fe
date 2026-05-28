"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AlertCircle, LoaderCircle, RefreshCw, Sparkles, TrendingUp, Zap } from "lucide-react";

import { useAnalyzeJob } from "@/services/queries";
import type { JobAnalysis, MarketPosition } from "@/types";
import { cn } from "@/lib/utils";

import { AttractivenessRing } from "./AttractivenessRing";

interface AttractivenessPanelProps {
  jobId: string | null;
  analysis: JobAnalysis | null;
  publishReady: boolean;
  publishIssues: string[];
}

const POSITION_BADGE: Record<MarketPosition, string> = {
  above_market: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  at_market:    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  below_market: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

export function AttractivenessPanel({ jobId, analysis, publishReady, publishIssues }: AttractivenessPanelProps) {
  const t = useTranslations("jobs");
  const analyze = useAnalyzeJob();

  const blocked = !publishReady;
  const blockedTooltip = blocked && publishIssues.length > 0
    ? t("attrPanel.notReadyTooltip", { issues: publishIssues.join(", ") })
    : undefined;

  const trigger = async () => {
    if (!jobId || blocked) return;
    try { await analyze.mutateAsync(jobId); }
    catch { toast.error(t("analysis.failed")); }
  };

  if (!jobId) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">{t("attrPanel.title")}</p>
          <p className="text-xs text-muted-foreground">{t("attrPanel.saveFirst")}</p>
        </div>
      </Card>
    );
  }

  if (!analysis || analysis.score === null || analysis.market_position === null) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">{t("attrPanel.title")}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {blocked
              ? t("attrPanel.notReady")
              : analyze.isError ? t("analysis.failed") : t("analysis.description")}
          </p>
          <button
            type="button"
            onClick={trigger}
            disabled={analyze.isPending || blocked}
            title={blockedTooltip}
            className="flex items-center gap-1.5 px-3 py-2 mt-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {analyze.isPending
              ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
              : <Sparkles className="w-3.5 h-3.5" />}
            {analyze.isPending ? t("analysis.analyzing") : t("analysis.analyze")}
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {t("attrPanel.title")}
        </h3>
        <button
          type="button"
          onClick={trigger}
          disabled={analyze.isPending || blocked}
          title={blockedTooltip}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t("analysis.refresh")}
        >
          {analyze.isPending
            ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
            : <RefreshCw className="w-3.5 h-3.5" />}
        </button>
      </header>

      <div className="flex flex-col items-center gap-3">
        <AttractivenessRing score={analysis.score} />
        <span className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
          POSITION_BADGE[analysis.market_position],
        )}>
          {t(`analysis.marketPosition.${analysis.market_position}` as never)}
        </span>
        {analysis.summary && (
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {analysis.summary}
          </p>
        )}
      </div>

      {(analysis.strengths.length > 0 || analysis.improvements.length > 0) && (
        <div className="mt-5 pt-5 border-t border-border space-y-4">
          {analysis.strengths.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-green-600 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" />
                {t("analysis.strengths")}
              </p>
              <ul className="space-y-1">
                {analysis.strengths.slice(0, 3).map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                    <span className="mt-1 w-1 h-1 rounded-full bg-green-500 shrink-0" />
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.improvements.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                {t("analysis.improvements")}
              </p>
              <ul className="space-y-1">
                {analysis.improvements.slice(0, 3).map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {analysis.urgency_message && (
        <div className="mt-4 pt-4 border-t border-border flex items-start gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            {analysis.urgency_message}
          </p>
        </div>
      )}
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-card border border-border rounded-xl p-5">{children}</div>;
}
