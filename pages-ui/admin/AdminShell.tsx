"use client";

import { usePathname } from "next/navigation";
import { AdminAuthGuard } from "./AdminAuthGuard";
import { AdminSidebar } from "./AdminSidebar";

/** Client wrapper holding the auth guard + sidebar. Extracted from the
 * route-group layout so the layout itself can stay server-side and
 * export Metadata (e.g. robots: noindex for the admin panel). */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith("/admin/login");

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </AdminAuthGuard>
  );
}
