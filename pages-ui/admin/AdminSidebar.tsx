"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, LogOut, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminLogout, useAdminMe } from "@/services/queries/admin.queries";

interface NavItem {
  label: string;
  href:  string;
  icon:  React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { label: "Panel",     href: "/admin",          icon: LayoutDashboard },
  { label: "Artykuły",  href: "/admin/articles", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: admin } = useAdminMe();
  const logout = useAdminLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace("/admin/login");
  };

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card/40 flex flex-col">
      {/* Branding strip — make it obvious this is the admin panel, not the
          recruiter dashboard. Different vibe ⇒ less chance of confusion. */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          wakanta.pl <span className="text-amber-400">admin</span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-1 truncate">
          {admin?.email ?? "…"}
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          // Highlight when the current path matches exactly OR starts with
          // a non-root nav target (so /admin/articles/123 still highlights
          // the "Artykuły" item).
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-amber-400/10 text-amber-400"
                  : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Wyloguj
        </button>
      </div>
    </aside>
  );
}
