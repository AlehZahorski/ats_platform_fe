"use client";

import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import apiClient from "@/services/api/client";

const LANGUAGES = [
  { code: "en", flag: "🇬🇧" },
  { code: "pl", flag: "🇵🇱" },
];

export function LanguageSwitcher() {
  const t = useTranslations("common.language");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const getCurrentLocale = () => {
    if (typeof document !== "undefined") {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith("locale="))
        ?.split("=")[1] ?? "en";
    }
    return "en";
  };

  const current = getCurrentLocale();

  const handleChange = async (code: string) => {
    // Persist in cookie
    document.cookie = `locale=${code}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // Update user language preference on backend (best-effort)
    try {
      await apiClient.patch("/users/me/language", { language: code });
    } catch {
      // non-critical — cookie is the source of truth for FE
    }

    setOpen(false);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-medium uppercase">{current}</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[140px]">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted ${
                  current === lang.code
                    ? "text-primary font-medium"
                    : "text-foreground"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{t(lang.code as "en" | "pl")}</span>
                {current === lang.code && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
