"use client";

import { useTranslations } from "next-intl";
import type { RiskFactor } from "@/types";
import { SeverityBadge } from "../shared/SeverityBadge";

interface RiskFactorsListProps {
  factors: RiskFactor[];
}

export function RiskFactorsList({ factors }: RiskFactorsListProps) {
  const t = useTranslations("jobs");

  if (factors.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {t("riskPanel.factorsTitle")}
      </p>
      <ul className="space-y-2">
        {factors.map((factor, i) => (
          <li key={`${factor.name}-${i}`} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-foreground truncate">{factor.name}</span>
            <SeverityBadge severity={factor.severity} />
          </li>
        ))}
      </ul>
    </div>
  );
}
