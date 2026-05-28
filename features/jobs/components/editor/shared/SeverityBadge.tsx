"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { RiskSeverity } from "@/types";

interface SeverityBadgeProps {
  severity: RiskSeverity;
  size?: "sm" | "md";
}

const SEVERITY_CLASSES: Record<RiskSeverity, string> = {
  high:   "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  low:    "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
};

/**
 * Localized colored badge for a risk severity level.
 *
 * Reads labels from the `jobs.severity.*` i18n namespace.
 */
export function SeverityBadge({ severity, size = "sm" }: SeverityBadgeProps) {
  const t = useTranslations("jobs");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        SEVERITY_CLASSES[severity],
      )}
    >
      {t(`severity.${severity}` as never)}
    </span>
  );
}
