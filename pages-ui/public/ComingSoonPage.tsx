import Link from "next/link";
import { Construction } from "lucide-react";
import { ROUTES } from "@/config/routes";

interface Props {
  title: string;
  subtitle?: string;
}

/**
 * Shared "Wkrótce" page for parts of wakanta.pl that the candidate-facing
 * nav links to (Firmy, Poradnik, O nas) but that we haven't built yet.
 *
 * Better than 404s — sets expectation that the section is on the roadmap.
 */
export function ComingSoonPage({ title, subtitle }: Props) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/10 text-amber-400 mb-5">
          <Construction className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-3">
          {subtitle || "Pracujemy nad tą sekcją. Wróć tu wkrótce!"}
        </p>
        <Link
          href={ROUTES.public.jobs}
          className="inline-block mt-6 px-5 py-2.5 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300"
        >
          Przeglądaj oferty pracy
        </Link>
      </div>
    </div>
  );
}
