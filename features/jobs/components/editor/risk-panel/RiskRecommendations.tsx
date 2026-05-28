"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";

interface RiskRecommendationsProps {
  recommendations: string[];
}

export function RiskRecommendations({ recommendations }: RiskRecommendationsProps) {
  const t = useTranslations("jobs");

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {t("riskPanel.recommendationsTitle")}
      </p>
      <ul className="space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
