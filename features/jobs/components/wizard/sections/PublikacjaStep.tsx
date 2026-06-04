"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Link2, Loader2, Plus, RotateCcw } from "lucide-react";
import type { JobEditorState } from "../../../types/job-editor.types";
import type { JobStatus } from "@/types";
import { ROUTES } from "@/config/routes";
import { useFormTemplates } from "@/services/queries/forms.queries";
import { useAssignTemplate } from "@/services/queries";
import { slugify } from "../../../lib/slugify";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40";

interface Props {
  state: JobEditorState;
  patch: (changes: Partial<JobEditorState>) => void;
  jobId: string | null;
  currentTemplateId: string | null;
}

const STATUSES: { value: JobStatus; label: string; desc: string }[] = [
  { value: "draft", label: "Szkic", desc: "Oferta widoczna tylko wewnątrz systemu" },
  { value: "open", label: "Opublikowana", desc: "Widoczna na własnej stronie karier, można aplikować" },
  { value: "closed", label: "Zamknięta", desc: "Niewidoczna publicznie, archiwum" },
];

export function PublikacjaStep({ state, patch, jobId, currentTemplateId }: Props) {
  const { data: templates, isLoading } = useFormTemplates();
  const assign = useAssignTemplate();
  const [pickedTemplateId, setPickedTemplateId] = useState<string | "">(currentTemplateId ?? "");
  // Track whether the user manually edited the slug. While untouched, the slug
  // mirrors the title automatically. After a manual edit we stop overwriting.
  const [slugTouched, setSlugTouched] = useState<boolean>(!!state.slug);

  // Auto-generate slug from title when the user hasn't touched it yet.
  useEffect(() => {
    if (slugTouched) return;
    const auto = slugify(state.title);
    if (auto !== state.slug) {
      patch({ slug: auto });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.title, slugTouched]);

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    patch({ slug: slugify(value) });
  };

  const resetSlug = () => {
    setSlugTouched(false);
    patch({ slug: slugify(state.title) });
  };

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://wakanta.pl";
  // Canonical, SEO-friendly public offer URL: /praca/<slug>-<uuid>. Matches
  // the indexed page and the sitemap entry.
  const offerPath = jobId
    ? ROUTES.public.job(jobId, state.slug || slugify(state.title))
    : ROUTES.public.jobs;
  const publicUrl = `${origin}${offerPath}`;

  const handleAssign = async (templateId: string) => {
    if (!jobId) return;
    setPickedTemplateId(templateId);
    await assign.mutateAsync({ id: jobId, template_id: templateId || null });
  };

  return (
    <div className="space-y-6">
      {/* ── Slug + Public URL ──────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-semibold mb-1.5">
          Adres URL oferty (slug)
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center rounded-lg border border-input bg-background overflow-hidden">
            <span className="px-3 py-2.5 text-xs text-muted-foreground border-r border-border bg-muted/30 whitespace-nowrap">
              {origin}/jobs/
            </span>
            <input
              value={state.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="np. senior-backend-developer-warszawa"
              className="flex-1 px-3 py-2.5 bg-transparent text-sm focus:outline-none"
            />
          </div>
          {slugTouched && state.title && (
            <button
              type="button"
              onClick={resetSlug}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-accent/40"
              title="Wygeneruj automatycznie z tytułu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Auto
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
          <Link2 className="w-3 h-3" />
          Pełny URL: <span className="text-foreground font-mono">{publicUrl}</span>
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">Status oferty</label>
        <div className="space-y-2">
          {STATUSES.map((s) => (
            <label
              key={s.value}
              className={`flex items-start gap-3 px-3.5 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                state.status === s.value
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-border hover:bg-accent/40"
              }`}
            >
              <input
                type="radio"
                name="status"
                value={s.value}
                checked={state.status === s.value}
                onChange={() => patch({ status: s.value })}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">Formularz aplikacyjny</label>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Ładowanie szablonów…
          </div>
        ) : !templates || templates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Brak szablonów. Utwórz formularz, żeby dodać własne pytania do kandydatów.
            </p>
            <Link
              href={ROUTES.forms}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-400 text-zinc-950 text-sm font-medium hover:bg-amber-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Przejdź do Szablonów formularzy
            </Link>
          </div>
        ) : (
          <>
            <select
              value={pickedTemplateId}
              onChange={(e) => handleAssign(e.target.value)}
              disabled={!jobId || assign.isPending}
              className={inputClass}
            >
              <option value="">Bez formularza (kandydat tylko CV)</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <Link
              href={ROUTES.forms}
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 mt-2"
            >
              <Plus className="w-3 h-3" />
              Utwórz nowy szablon
            </Link>
          </>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Dodatkowe pytania do kandydata. Bez formularza wystarczy CV + e‑mail.
        </p>
      </div>

      {jobId && state.status === "open" && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="text-sm font-medium text-emerald-500 mb-1">Link do publicznej oferty</div>
          <a
            href={offerPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-foreground hover:underline"
          >
            {publicUrl}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

export function publikacjaSummary(state: JobEditorState, templateName: string | null): string {
  const status = STATUSES.find((s) => s.value === state.status)?.label || state.status;
  const parts = [status];
  if (templateName) parts.push(`Formularz: ${templateName}`);
  return parts.join(" · ");
}

// Re-export for stepper hint texts
export { STATUSES };
