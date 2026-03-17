"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Bell } from "lucide-react";
import { useMe } from "@/services/queries";
import { getInitials } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export function Topbar({ title }: { title?: string }) {
  const { theme, setTheme } = useTheme();
  const { data: user } = useMe();

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <h1 className="font-display text-xl font-semibold text-foreground">
        {title}
      </h1>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
          <Bell className="w-4 h-4" />
        </button>

        {user && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            {getInitials(user.email)}
          </div>
        )}
      </div>
    </header>
  );
}
