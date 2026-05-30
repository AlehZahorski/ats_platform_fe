"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface ChipOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface Props<T extends string> {
  value: T | null;
  options: ChipOption<T>[];
  onChange: (v: T) => void;
  className?: string;
  /** Pulsing amber outline when the (required) group has no selection yet. */
  highlight?: boolean;
}

export function ChipGroup<T extends string>({ value, options, onChange, className, highlight }: Props<T>) {
  return (
    <div
      className={cn(
        "grid gap-2",
        highlight && "rounded-lg ring-2 ring-amber-400/50 animate-pulse p-1.5 -m-1.5",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
              active
                ? "border-amber-400 bg-amber-400/10 text-amber-400"
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent/40"
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
