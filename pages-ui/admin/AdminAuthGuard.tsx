"use client";

import { useEffect } from "react";
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
  const { data: admin, isLoading, error } = useAdminMe();

  useEffect(() => {
    if (!isLoading && (error || !admin)) {
      router.replace("/admin/login");
    }
  }, [admin, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoaderCircle className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }
  if (!admin) return null;

  return <>{children}</>;
}
