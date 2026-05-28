"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisibilityBadge, type SectionVisibility } from "./VisibilityBadge";

interface CollapsibleSectionProps {
  number: number;
  title: string;
  defaultOpen?: boolean;
  visibility?: SectionVisibility;
  children: ReactNode;
}

/**
 * Accordion shell used by every editor section.
 *
 * Renders a numbered header (`1. Title`) that toggles the body open/closed.
 * Open state is local — the parent does not need to track it.
 */
export function CollapsibleSection({
  number,
  title,
  defaultOpen = true,
  visibility,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={cn(
      "bg-card border rounded-xl overflow-hidden",
      visibility === "internal" ? "border-amber-500/20" : "border-border",
    )}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 hover:bg-muted/30 transition-colors"
      >
        <h2 className="font-semibold text-foreground text-sm flex items-center gap-3 min-w-0">
          <span className="text-muted-foreground tabular-nums shrink-0">{number}.</span>
          <span className="truncate">{title}</span>
          {visibility && <VisibilityBadge visibility={visibility} />}
        </h2>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="px-6 pb-6 pt-2 border-t border-border animate-fade-in">
          {children}
        </div>
      )}
    </section>
  );
}
