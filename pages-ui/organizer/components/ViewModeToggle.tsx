"use client";
import { cn } from "@/lib/utils";

interface Props {
  value: "self" | "team";
  onChange: (v: "self" | "team") => void;
}

export function ViewModeToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-background p-1">
      <button
        type="button"
        onClick={() => onChange("self")}
        className={cn(
          "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
          value === "self"
            ? "bg-foreground/5 text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Mój tydzień
      </button>
      <button
        type="button"
        onClick={() => onChange("team")}
        className={cn(
          "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
          value === "team"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Cały zespół
      </button>
    </div>
  );
}
