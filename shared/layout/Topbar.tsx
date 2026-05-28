"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Sun, Moon, Bell } from "lucide-react";
import { useMe } from "@/services/queries";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { LanguageSwitcher } from "@/shared/layout/LanguageSwitcher";

export function Topbar({ title }: { title?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: user } = useMe();
  const tA11y = useTranslations("a11y");

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <h1 className="font-display text-xl font-semibold text-foreground">
        {title}
      </h1>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {/* A11Y-026 (audit_accessibility): decorative icon next to a labelled
              button — hide from SR so it doesn't read "graphic". */}
          {resolvedTheme === "dark" ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
        </button>

        {/* A11Y-008 (audit_accessibility): icon-only button needs an accessible
            name (WCAG 4.1.2). */}
        <button
          type="button"
          aria-label={tA11y("notifications")}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
        </button>

        {user && <UserAvatar user={user} size={32} />}
      </div>
    </header>
  );
}
