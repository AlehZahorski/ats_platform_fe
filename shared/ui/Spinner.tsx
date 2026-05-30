// audit_ux_ui: extracted from the 12+ duplicates of `<div className="w-8 h-8
// border-2 border-primary border-t-transparent rounded-full animate-spin" />`
// that were copy-pasted across DashboardShell, ApplyPage, TrackPage, the job
// editor and others. Centralising the markup lets us evolve the loading
// affordance once (e.g. swap to a Radix spinner, animate-pulse during
// reduced-motion) without hunting through 12 files.

import { cn } from "@/lib/utils";

interface SpinnerProps {
  /** Tailwind size class. Default 8 (32 px). */
  size?: number;
  /** Tailwind border-color utility. Default `border-primary`. */
  colorClassName?: string;
  /** Extra classes for the wrapper — e.g. centring, screen-fill. */
  className?: string;
  /** SR text. Defaults to "Loading"; pass a translated string in callers. */
  label?: string;
}

export function Spinner({
  size = 8,
  colorClassName = "border-primary",
  className,
  label = "Loading",
}: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" className={cn("inline-block", className)}>
      <span
        aria-hidden="true"
        className={cn(
          `w-${size} h-${size}`,
          "border-2 rounded-full border-t-transparent animate-spin",
          colorClassName,
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Full-viewport spinner — same look as the duplicated full-screen loaders. */
export function FullPageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Spinner label={label} />
    </div>
  );
}
