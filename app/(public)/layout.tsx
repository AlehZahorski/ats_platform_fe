import { PublicTopNav } from "@/shared/layout/PublicTopNav";
import { PublicFooter } from "@/shared/layout/PublicFooter";

/**
 * Public-facing layout for the candidate side of wakanta.pl.
 * Wraps every route under `(public)` with the candidate top nav and
 * trust-signal footer. HR/recruiter routes live in `(dashboard)` and
 * have a different layout.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicTopNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
