"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Heart, LogOut, Search, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCandidateMe, useCandidateLogout } from "@/services/queries/jobBoard.queries";
import { ROUTES } from "@/config/routes";
import { ProfileSection } from "./sections/ProfileSection";
import { SavedJobsSection } from "./sections/SavedJobsSection";
import { SavedSearchesSection } from "./sections/SavedSearchesSection";

type Tab = "profile" | "saved" | "searches";

interface Props {
  defaultTab?: Tab;
}

export function CandidateAccountPage({ defaultTab = "profile" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: me, isLoading } = useCandidateMe();
  const logout = useCandidateLogout();
  const [tab, setTab] = useState<Tab>(defaultTab);

  // Sync tab to URL path so /konto/obserwowane et al. work
  useEffect(() => {
    if (pathname === ROUTES.candidate.savedJobs) setTab("saved");
    else if (pathname === ROUTES.candidate.savedSearches) setTab("searches");
    else setTab("profile");
  }, [pathname]);

  // Redirect to login if not authed
  useEffect(() => {
    if (!isLoading && !me) {
      const next = encodeURIComponent(pathname);
      router.replace(`${ROUTES.candidate.login}?next=${next}`);
    }
  }, [isLoading, me, router, pathname]);

  const handleLogout = async () => {
    await logout.mutateAsync();
    toast.success("Wylogowano");
    router.push(ROUTES.public.home);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!me) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
        {/* Left: side nav */}
        <aside className="space-y-1">
          <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Moje konto
          </div>
          <NavItem
            icon={User}
            label="Profil"
            href={ROUTES.candidate.account}
            active={tab === "profile"}
          />
          <NavItem
            icon={Heart}
            label="Obserwowane oferty"
            href={ROUTES.candidate.savedJobs}
            active={tab === "saved"}
          />
          <NavItem
            icon={Search}
            label="Zapisane wyszukiwania"
            href={ROUTES.candidate.savedSearches}
            active={tab === "searches"}
          />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg text-sm text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Wyloguj
          </button>
        </aside>

        {/* Right: tab content */}
        <main>
          {tab === "profile" && <ProfileSection />}
          {tab === "saved" && <SavedJobsSection />}
          {tab === "searches" && <SavedSearchesSection />}
        </main>
      </div>
    </div>
  );
}

function NavItem({
  icon: Icon, label, href, active,
}: { icon: React.ElementType; label: string; href: string; active: boolean }) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-amber-400/10 text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </a>
  );
}
