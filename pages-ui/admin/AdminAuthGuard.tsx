"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useAdminMe } from "@/services/queries/admin.queries";

interface Props {
  children: React.ReactNode;
}

/** Wraps every authenticated /admin page. Redirects to /admin/login
 * whenever /admin/auth/me fails (no cookie / expired session). */
export function AdminAuthGuard({ children }: Props) {
  const router = useRouter();
  // useAdminMe is gated on a localStorage flag that doesn't exist during
  // SSR, so the server and the first client paint disagree on whether the
  // query is loading. Pin both to the spinner until we've mounted on the
  // client, then let the real auth state take over — avoids the hydration
  // mismatch React was throwing here.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: admin, isLoading, error } = useAdminMe();

  useEffect(() => {
    if (mounted && !isLoading && (error || !admin)) {
      router.replace("/admin/login");
    }
  }, [mounted, admin, isLoading, error, router]);

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoaderCircle className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }
  if (!admin) return null;

  return <>{children}</>;
}
