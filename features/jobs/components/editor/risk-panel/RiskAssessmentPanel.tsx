"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { LoaderCircle, RefreshCw, Shield, ShieldAlert, Sparkles } from "lucide-react";

import { useAssessRisk } from "@/services/queries";
import type { JobRiskAssessment, RiskLevel } from "@/types";
import { cn } from "@/lib/utils";

import { RiskScoreRing } from "./RiskScoreRing";
import { RiskFactorsList } from "./RiskFactorsList";
import { RiskRecommendations } from "./RiskRecommendations";

interface RiskAssessmentPanelProps {
  jobId: string | null;
  assessment: JobRiskAssessment | null;
}

const LEVEL_BADGE: Record<RiskLevel, string> = {
  high:   "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  low:    "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
};

export function RiskAssessmentPanel({ jobId, assessment }: RiskAssessmentPanelProps) {
  const t = useTranslations("jobs");
  const assess = useAssessRisk();

  const trigger = async () => {
    if (!jobId) return;
    try {
      await assess.mutateAsync(jobId);
    } catch {
      toast.error(t("riskPanel.failed"));
    }
  };

  // ── 1. Create mode, no jobId yet → disabled CTA ──────────────────────
  if (!jobId) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Shield className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">{t("riskPanel.title")}</p>
          <p className="text-xs text-muted-foreground">{t("riskPanel.saveFirst")}</p>
        </div>
      </Card>
    );
  }

  // ── 2. No assessment yet → manual CTA (premium feature) ─────────────
  if (!assessment) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">{t("riskPanel.title")}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {assess.isError ? t("riskPanel.failed") : t("riskPanel.intro")}
          </p>
          <button
            type="button"
            onClick={trigger}
            disabled={assess.isPending}
            className="flex items-center gap-1.5 px-3 py-2 mt-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            {assess.isPending
              ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
              : <Sparkles className="w-3.5 h-3.5" />}
            {assess.isPending ? t("riskPanel.running") : t("riskPanel.runAssessment")}
          </button>
        </div>
      </Card>
    );
  }

  // ── 3. Full assessment view ──────────────────────────────────────────
  const score = assessment.score ?? 0;
  const level = (assessment.level ?? "medium") as RiskLevel;

  return (
    <Card>
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          {t("riskPanel.title")}
        </h3>
        <button
          type="button"
          onClick={trigger}
          disabled={assess.isPending}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all disabled:opacity-50"
          aria-label={t("riskPanel.refresh")}
        >
          {assess.isPending ? (
            <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
        </button>
      </header>

      <div className="flex flex-col items-center gap-3">
        <RiskScoreRing score={score} level={level} />
        <span className={cn(
          "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
          LEVEL_BADGE[level],
        )}>
          {t(`riskPanel.level.${level}` as never)}
        </span>
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          {t(`riskPanel.levelDesc.${level}` as never)}
        </p>
      </div>

      <div className="mt-5 pt-5 border-t border-border space-y-5">
        <RiskFactorsList factors={assessment.factors} />
        <RiskRecommendations recommendations={assessment.recommendations} />
      </div>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-card border border-border rounded-xl p-5">{children}</div>;
}
