"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard, Briefcase, Users, FileText,
  GitBranch, Tag, LogOut,
  CalendarDays, BarChart2, Mail, Zap, Shield, UsersRound, Building2, Newspaper,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/shared/ui/Logo";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { useLogout, useMe } from "@/services/queries";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { AvatarPicker } from "@/pages-ui/organizer/components/AvatarPicker";

// "Panel" sits above the grouped sections — it's the home/overview entry.
const homeItem = { key: "dashboard", href: ROUTES.dashboard, icon: LayoutDashboard };

// Sidebar navigation grouped by domain. `groupKey` resolves to a section
// header via `nav.groups.*`. `ownerOnly` items are hidden from non-owners
// (recruiters mustn't edit brand profile or manage the team).
const navGroups: {
  groupKey: string;
  items: { key: string; href: string; icon: React.ElementType; ownerOnly?: boolean }[];
}[] = [
  {
    groupKey: "recruitment",
    items: [
      { key: "jobs",         href: ROUTES.jobs,         icon: Briefcase },
      { key: "applications", href: ROUTES.applications, icon: Users },
      { key: "pipeline",     href: ROUTES.pipeline,     icon: GitBranch },
      { key: "tags",         href: ROUTES.tags,         icon: Tag },
    ],
  },
  {
    groupKey: "candidates",
    items: [
      { key: "forms",          href: ROUTES.forms,                   icon: FileText },
      { key: "emailTemplates", href: ROUTES.settings.emailTemplates, icon: Mail },
      { key: "automations",    href: ROUTES.settings.automations,    icon: Zap },
    ],
  },
  {
    groupKey: "work",
    items: [
      { key: "organizer", href: ROUTES.organizer, icon: CalendarDays },
      { key: "reports",   href: ROUTES.reports,   icon: BarChart2 },
    ],
  },
  {
    groupKey: "content",
    // Content marketing for the company — articles published on /firmy-pisza
    items: [{ key: "articles", href: ROUTES.articles, icon: Newspaper }],
  },
  {
    groupKey: "admin",
    items: [
      { key: "gdpr",           href: ROUTES.settings.gdpr,           icon: Shield },
      { key: "companyProfile", href: ROUTES.settings.companyProfile, icon: Building2, ownerOnly: true },
      { key: "team",           href: ROUTES.settings.team,           icon: UsersRound, ownerOnly: true },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tA11y = useTranslations("a11y");
  const logout = useLogout();
  const router = useRouter();
  const { data: me } = useMe();
  const isOwner = me?.role === "owner";
  const [avatarOpen, setAvatarOpen] = useState(false);

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push(ROUTES.login);
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
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/5"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        {t(key as never)}
      </Link>
    );
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center px-4 py-4 border-b border-sidebar-border">
        <Logo className="h-11 w-auto" />
      </div>

      {/* Nav */}
      {/* A11Y-006 (audit_accessibility): label the landmark so SR rotor
          distinguishes this <nav> from Topbar / Public nav. */}
      <nav aria-label={tA11y("mainNavigation")} className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {/* Home / overview — always first, ungrouped */}
        {renderItem(homeItem)}

        {navGroups.map((group) => {
          // Drop owner-only entries for non-owners; skip the whole group if
          // nothing remains (keeps the header from rendering over an empty list).
          const visible = group.items.filter((item) => isOwner || !item.ownerOnly);
          if (visible.length === 0) return null;
          return (
            <div key={group.groupKey} className="pt-3 mt-3 border-t border-sidebar-border/50">
              <p className="px-3 pb-1.5 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wide">
                {t(`groups.${group.groupKey}` as never)}
              </p>
              {visible.map(renderItem)}
            </div>
          );
        })}
      </nav>

      {/* Account */}
      <div className="px-3 py-3 border-t border-sidebar-border space-y-2">
        {me && (
          <button
            type="button"
            onClick={() => setAvatarOpen(true)}
            className="flex items-center gap-3 px-2 py-2 w-full rounded-lg hover:bg-sidebar-foreground/5 transition-colors"
            // A11Y-010 (audit_accessibility): `title` alone is unreliable for
            // SR; pair it with aria-label so the action ("Change avatar") is
            // announced together with the user's name.
            title={tA11y("changeAvatar")}
            aria-label={`${tA11y("changeAvatar")} — ${nameFromEmail(me.email)}`}
          >
            <UserAvatar user={me} size={36} />
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium truncate">{nameFromEmail(me.email)}</div>
              <div className="text-xs text-sidebar-foreground/60 capitalize">{me.role}</div>
            </div>
          </button>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/5 transition-all"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          {t("logout")}
        </button>
      </div>

      <AvatarPicker open={avatarOpen} onClose={() => setAvatarOpen(false)} />
    </aside>
  );
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.split(/[._-]/).filter(Boolean).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}
