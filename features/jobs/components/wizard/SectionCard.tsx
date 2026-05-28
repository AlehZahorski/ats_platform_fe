"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { statusBadgeClasses, statusLabel, type SectionStatus } from "./lib/completeness";

interface Props {
  number: number;
  title: string;
  status: SectionStatus;
  defaultExpanded?: boolean;
  summary?: ReactNode;
  children: ReactNode;
  onExpand?: () => void;
}

export function SectionCard({ number, title, status, defaultExpanded = false, summary, children, onExpand }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = () => {
    if (!expanded) onExpand?.();
    setExpanded((e) => !e);
  };

  // Cały kafelek klikalny gdy zwinięty. Po rozwinięciu klik tła nie zwija
  // (żeby nie zamknąć formularza przez przypadek podczas edycji) — do zwijania
  // służy przycisk "Zwiń" po prawej.
  const CardTag = expanded ? "section" : "button";
  const cardProps = expanded
    ? {}
    : {
        type: "button" as const,
        onClick: toggle,
        "aria-expanded": false as const,
      };

  return (
    <CardTag
      {...cardProps}
      className={cn(
        "block w-full text-left border border-border rounded-xl bg-card transition-colors",
        !expanded && "hover:bg-accent/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/50"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-5 py-4",
          expanded && "border-b border-border"
        )}
      >
        <h3 className="text-base font-semibold">
          {number}. {title}
        </h3>
        <div className="flex items-center gap-3">
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", statusBadgeClasses(status))}>
            {statusLabel(status)}
          </span>
          {!expanded ? (
            <span className="text-sm text-amber-400 font-medium pointer-events-none">
              Edytuj
            </span>
          ) : (
            <button
              type="button"
              onClick={toggle}
              className="text-sm text-muted-foreground hover:text-foreground font-medium"
            >
              Zwiń
            </button>
          )}
        </div>
      </div>

      {!expanded && summary && (
        <div className="px-5 py-3 text-sm text-muted-foreground">{summary}</div>
      )}

      {expanded && <div className="px-5 py-5">{children}</div>}
    </CardTag>
  );
}
