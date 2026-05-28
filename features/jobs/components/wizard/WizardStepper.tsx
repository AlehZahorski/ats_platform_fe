"use client";

import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionStatus } from "./lib/completeness";

export interface StepDefinition {
  id: string;
  label: string;
  hint: string;
  status: SectionStatus;
  progress: number;     // 0-100, drives the mini bar
  missing: string[];    // shown in title tooltip on hover
}

interface Props {
  steps: StepDefinition[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

export function WizardStepper({ steps, activeIndex, onSelect }: Props) {
  return (
    <ol className="space-y-1">
      {steps.map((step, i) => {
        const isActive = i === activeIndex;
        const isComplete = step.status === "complete";
        const tooltip =
          step.missing.length > 0
            ? `Brakuje:\n• ${step.missing.join("\n• ")}`
            : "Sekcja kompletna";
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              title={tooltip}
              className={cn(
                "w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors",
                isActive ? "bg-amber-400/10" : "hover:bg-accent/40"
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-xs font-semibold",
                  isActive
                    ? "bg-amber-400 text-black"
                    : isComplete
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {isComplete && !isActive ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className={cn("text-sm font-medium truncate", isActive ? "text-foreground" : "text-foreground/80")}>
                    {step.label}
                  </div>
                  {step.missing.length > 0 && !isComplete && (
                    <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{step.hint}</div>
                {/* Progress bar */}
                <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      step.progress === 100
                        ? "bg-emerald-500"
                        : step.progress >= 50
                          ? "bg-amber-400"
                          : "bg-rose-500/60"
                    )}
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
