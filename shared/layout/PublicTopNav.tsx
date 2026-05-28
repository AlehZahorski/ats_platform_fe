"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ChevronDown, Menu, X, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/shared/ui/Logo";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { ROUTES } from "@/config/routes";
import { useCandidateMe } from "@/services/queries/jobBoard.queries";

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Oferty pracy", href: ROUTES.public.jobs },
  { label: "Firmy",        href: ROUTES.public.companies },
  { label: "Poradnik",     href: ROUTES.public.guide },
  { label: "O nas",        href: ROUTES.public.about },
];

export function PublicTopNav() {
  const pathname = usePathname();
  const { data: candidate } = useCandidateMe();
  const [menuOpen, setMenuOpen] = useState(false);

  // Auto-close drawer after navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll while the drawer is open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4 lg:gap-8">
        <Link href={ROUTES.public.home} className="shrink-0">
          <Logo className="h-9 w-auto" />
        </Link>

        {/* Desktop nav links — hidden below lg */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors rounded-md",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Employer CTA + heart — hidden on small screens (live in the drawer) */}
        <Link
          href={ROUTES.login}
          className="hidden md:inline-flex px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent/40 transition-colors"
        >
          Dla pracodawców
        </Link>

        <Link
          href={candidate ? ROUTES.candidate.savedJobs : ROUTES.candidate.login}
          className="hidden md:inline-flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40"
          title="Obserwowane oferty"
        >
          <Heart className="w-5 h-5" />
        </Link>

        {/* Account — compact on mobile (avatar only), full label on lg+ */}
        {candidate ? (
          <Link
            href={ROUTES.candidate.account}
            className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-accent/40 transition-colors"
          >
            <UserAvatar user={candidate} size={32} />
            <span className="hidden lg:inline text-sm font-medium">{candidate.full_name || "Moje konto"}</span>
            <ChevronDown className="hidden lg:inline w-3.5 h-3.5 text-muted-foreground" />
          </Link>
        ) : (
          <Link
            href={ROUTES.candidate.login}
            className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-accent/40 transition-colors"
          >
            <UserAvatar user={null} size={32} />
            <span className="hidden lg:inline text-sm font-medium">Moje konto</span>
          </Link>
        )}

        {/* Hamburger — visible below lg */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-accent/40"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>

    {/* ── Mobile drawer (slides from the right) ─────────────────────────
        Rendered OUTSIDE the <header> on purpose. The header has
        `backdrop-blur-md`, which creates a CSS containing block for any
        `position: fixed` descendants — without this fix the drawer would be
        positioned relative to the 64px-tall header instead of the viewport,
        making the body content invisible / showing through. */}
    {menuOpen && (
      <>
          <button
            type="button"
            aria-label="Zamknij menu"
            onClick={() => setMenuOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <div className="lg:hidden fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-background border-l border-border overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <Logo className="h-8 w-auto" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-md hover:bg-accent/40"
                aria-label="Zamknij"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Candidate identity strip */}
            <div className="px-4 py-4 border-b border-border">
              {candidate ? (
                <Link
                  href={ROUTES.candidate.account}
                  className="flex items-center gap-3 group"
                >
                  <UserAvatar user={candidate} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {candidate.full_name || candidate.email}
                    </div>
                    <div className="text-xs text-muted-foreground group-hover:text-foreground">
                      Przejdź do konta →
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href={ROUTES.candidate.login}
                    className="w-full text-center px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300"
                  >
                    Zaloguj się
                  </Link>
                  <Link
                    href={ROUTES.candidate.signup}
                    className="w-full text-center px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent/40"
                  >
                    Utwórz konto
                  </Link>
                </div>
              )}
            </div>

            <nav className="flex-1 px-2 py-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-amber-400/10 text-amber-400"
                        : "text-foreground hover:bg-accent/40"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href={candidate ? ROUTES.candidate.savedJobs : ROUTES.candidate.login}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent/40"
              >
                <Heart className="w-4 h-4 text-muted-foreground" />
                Obserwowane oferty
              </Link>
            </nav>

            <div className="px-4 py-4 border-t border-border">
              <Link
                href={ROUTES.login}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent/40 justify-center"
              >
                <Briefcase className="w-4 h-4" />
                Dla pracodawców
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
