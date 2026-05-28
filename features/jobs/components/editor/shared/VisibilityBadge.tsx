"use client";

import { useTranslations } from "next-intl";
import { Eye, Lock, Split } from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionVisibility = "public" | "internal" | "mixed";

interface VisibilityBadgeProps {
  visibility: SectionVisibility;
}

const STYLES: Record<SectionVisibility, { icon: typeof Eye; cls: string }> = {
  public:   { icon: Eye,   cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  internal: { icon: Lock,  cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  mixed:    { icon: Split, cls: "bg-muted text-muted-foreground border-border" },
};

export function VisibilityBadge({ visibility }: VisibilityBadgeProps) {
  const t = useTranslations("jobs");
  const { icon: Icon, cls } = STYLES[visibility];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap",
        cls,
      )}
    >
      <Icon className="w-3 h-3" />
      {t(`visibility.${visibility}` as never)}
    </span>
  );
}
