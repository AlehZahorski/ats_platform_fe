"use client";

import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { useAdminMe, useAdminArticles } from "@/services/queries/admin.queries";

export function AdminDashboardPage() {
  const { data: admin } = useAdminMe();
  // Quick stats — total + draft count. The list query is cheap and already
  // cached, so this doesn't add load even when revisited often.
  const { data: total }    = useAdminArticles({ limit: 1 });
  const { data: drafts }   = useAdminArticles({ limit: 1, status: "draft" });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold">
        Cześć, {admin?.full_name || admin?.email?.split("@")[0] || "adminie"}
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Panel administratora platformy. Stąd zarządzasz treścią i konfiguracją.
      </p>

      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Artykuły"
          value={total?.total ?? "…"}
          hint={drafts?.total != null ? `${drafts.total} szkic${drafts.total === 1 ? "" : drafts.total < 5 ? "e" : "ów"}` : "—"}
          href="/admin/articles"
        />
        {/* Placeholders for future modules. They're disabled today, but
            keeping them as faded tiles communicates the plan without
            requiring a separate roadmap page. */}
        <ComingSoonTile title="Newsletter" description="Lista subskrybentów + eksport CSV." />
        <ComingSoonTile title="Weryfikacja firm" description="Nadawanie zielonych ptaszków na /firmy." />
      </section>
    </div>
  );
}


function StatCard({
  title, value, hint, href,
}: { title: string; value: React.ReactNode; hint: string; href: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card p-5 hover:border-amber-400/40 transition-colors block"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{hint}</div>
        </div>
        <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-colors">
          <FileText className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-4 inline-flex items-center text-xs text-amber-400">
        Przejdź <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </Link>
  );
}


function ComingSoonTile({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-5 opacity-70">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{description}</div>
      <div className="mt-4 text-[11px] text-muted-foreground/60">Wkrótce</div>
    </div>
  );
}
