"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/shared/layout/Sidebar";
import { ROUTES } from "@/config/routes";
import { useMe } from "@/services/queries";

/** Client wrapper for the authenticated recruiter dashboard. Holds the
 * auth guard + sidebar. Extracted from the route-group layout so the
 * layout itself can stay server-side and export noindex metadata. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, error } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (error || !user)) {
      router.replace(ROUTES.login);
    }
  }, [user, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      {/* A11Y-003 (audit_accessibility): id is the skip-link target from
          RootLayout. tabIndex={-1} lets us focus it programmatically when the
          skip link fires. WCAG 2.4.1 Bypass Blocks. */}
      <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 outline-none">{children}</main>
    </div>
  );
}
