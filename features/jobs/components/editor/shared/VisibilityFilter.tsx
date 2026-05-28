"use client";

import { useTranslations } from "next-intl";
import { Eye, Layers, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "all" | "candidate" | "recruiter";

interface VisibilityFilterProps {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
}

const OPTIONS: { value: ViewMode; icon: typeof Layers }[] = [
  { value: "all",       icon: Layers },
  { value: "candidate", icon: Eye    },
  { value: "recruiter", icon: Lock   },
];

/**
 * Segmented control for filtering editor sections by audience.
 *   • all       — show every section (default)
 *   • candidate — only what goes to the public job board
 *   • recruiter — only internal HR / manager fields
 */
export function VisibilityFilter({ value, onChange }: VisibilityFilterProps) {
  const t = useTranslations("jobs");
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-border bg-card">
      {OPTIONS.map(({ value: v, icon: Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            value === v
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {t(`visibility.filter.${v}` as never)}
        </button>
      ))}
    </div>
  );
}
