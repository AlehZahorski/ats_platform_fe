import { Check } from "lucide-react";
import { WIZARD_STEPS } from "../../types/job-wizard.types";
import type { WizardStep } from "../../types/job-wizard.types";

interface WizardProgressBarProps {
  currentStep: WizardStep;
}

export function WizardProgressBar({ currentStep }: WizardProgressBarProps) {
  const steps = Object.entries(WIZARD_STEPS) as [string, { label: string; description: string }][];

  return (
    <div className="flex items-center gap-0">
      {steps.map(([key, { label }], index) => {
        const stepNum = Number(key) as WizardStep;
        const done = stepNum < currentStep;
        const active = stepNum === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  done  ? "bg-primary text-primary-foreground" :
                  active ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                  "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`text-xs font-medium text-center leading-tight hidden sm:block ${
                active ? "text-foreground" : "text-muted-foreground"
              }`}>
                {label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 flex-1 mx-2 mb-5 transition-colors ${
                done ? "bg-primary" : "bg-border"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
