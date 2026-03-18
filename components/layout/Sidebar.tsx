"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard, Briefcase, Users, FileText,
  GitBranch, Tag, LogOut, ChevronRight,
  CheckSquare, BarChart2, Mail, Zap, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLogout } from "@/services/queries";
import { useRouter } from "next/navigation";

const navItems = [
  { key: "dashboard",    href: "/dashboard",              icon: LayoutDashboard },
  { key: "jobs",         href: "/dashboard/jobs",         icon: Briefcase },
  { key: "applications", href: "/dashboard/applications", icon: Users },
  { key: "forms",        href: "/dashboard/forms",        icon: FileText },
  { key: "pipeline",     href: "/dashboard/pipeline",     icon: GitBranch },
  { key: "tags",         href: "/dashboard/tags",         icon: Tag },
  { key: "tasks",        href: "/dashboard/tasks",        icon: CheckSquare },
  { key: "reports",      href: "/dashboard/reports",      icon: BarChart2 },
];

const settingsItems = [
  { key: "emailTemplates", href: "/dashboard/settings/email-templates", icon: Mail },
  { key: "automations",    href: "/dashboard/settings/automations",     icon: Zap },
  { key: "gdpr",           href: "/dashboard/settings/gdpr",            icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const logout = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push("/login");
  };

  const renderItem = ({ key, href, icon: Icon }: { key: string; href: string; icon: React.ElementType }) => {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        key={key}
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
          active
            ? "bg-primary text-primary-foreground"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {t(key as never)}
      </Link>
    );
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <ChevronRight className="w-5 h-5 text-primary-foreground" strokeWidth={3} />
        </div>
        <span className="font-display font-bold text-lg text-sidebar-foreground tracking-tight">
          TalentFlow
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(renderItem)}

        {/* Settings group */}
        <div className="pt-3 mt-3 border-t border-sidebar-border/50">
          <p className="px-3 pb-1.5 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wide">
            {t("settings")}
          </p>
          {settingsItems.map(renderItem)}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}