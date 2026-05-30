"use client";

import type { JobEditorState } from "../../../types/job-editor.types";
import { pulseIfEmpty } from "../lib/fieldHighlight";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40";

interface Props {
  state: JobEditorState;
  patch: (changes: Partial<JobEditorState>) => void;
}

export function ZakresRoliStep({ state, patch }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold mb-1.5">Opis roli *</label>
        <textarea
          value={state.role_summary}
          onChange={(e) => patch({ role_summary: e.target.value })}
          rows={4}
          placeholder="Krótki opis czym będzie zajmować się ta osoba w firmie…"
          className={`${inputClass} resize-none${pulseIfEmpty(!state.role_summary.trim())}`}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">Cel roli *</label>
        <textarea
          value={state.role_purpose}
          onChange={(e) => patch({ role_purpose: e.target.value })}
          rows={3}
          placeholder="Po co istnieje to stanowisko? Jaki problem rozwiązuje / jaki cel realizuje…"
          className={`${inputClass} resize-none${pulseIfEmpty(!state.role_purpose.trim())}`}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">Obowiązki *</label>
        <textarea
          value={state.responsibilities}
          onChange={(e) => patch({ responsibilities: e.target.value })}
          rows={6}
          placeholder="Wypunktuj kluczowe obowiązki, jeden na linię…"
          className={`${inputClass} resize-none${pulseIfEmpty(!state.responsibilities.trim())}`}
        />
        <p className="text-xs text-muted-foreground mt-1">Każda linia traktowana jako osobny punkt na ofercie.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">Kontekst zespołu *</label>
        <textarea
          value={state.team_context}
          onChange={(e) => patch({ team_context: e.target.value })}
          rows={3}
          placeholder="Z kim będzie pracować, wielkość zespołu, kultura…"
          className={`${inputClass} resize-none${pulseIfEmpty(!state.team_context.trim())}`}
        />
      </div>
    </div>
  );
}

export function zakresRoliSummary(state: JobEditorState): string {
  const text = state.role_summary || state.responsibilities;
  if (!text.trim()) return "Brak opisu";
  const trimmed = text.trim().slice(0, 140);
  const count = state.responsibilities.split(/\n+/).filter((l) => l.trim().length > 0).length;
  if (count > 0) {
    return `${trimmed}${text.length > 140 ? "…" : ""}`;
  }
  return trimmed;
}
