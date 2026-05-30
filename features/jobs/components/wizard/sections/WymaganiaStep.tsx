"use client";

import type { JobEditorState } from "../../../types/job-editor.types";
import { pulseIfEmpty } from "../lib/fieldHighlight";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40";

interface Props {
  state: JobEditorState;
  patch: (changes: Partial<JobEditorState>) => void;
}

export function WymaganiaStep({ state, patch }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold mb-1.5">Wymagane umiejętności *</label>
        <textarea
          value={state.must_haves}
          onChange={(e) => patch({ must_haves: e.target.value })}
          rows={5}
          placeholder="Każda umiejętność w nowej linii (np. Python, Django, PostgreSQL…)"
          className={`${inputClass} resize-none${pulseIfEmpty(!state.must_haves.trim())}`}
        />
        <p className="text-xs text-muted-foreground mt-1">Linia = jedna umiejętność. Pokazuje się jako chip na ofercie.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">Mile widziane *</label>
        <textarea
          value={state.nice_to_haves}
          onChange={(e) => patch({ nice_to_haves: e.target.value })}
          rows={4}
          placeholder="Dodatkowe umiejętności, jedna na linię…"
          className={`${inputClass} resize-none${pulseIfEmpty(!state.nice_to_haves.trim())}`}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5">Stack technologiczny / narzędzia *</label>
        <textarea
          value={state.tech_stack}
          onChange={(e) => patch({ tech_stack: e.target.value })}
          rows={4}
          placeholder="Technologie i narzędzia, jedno na linię (np. Python, Docker, Excel, wózek widłowy…)"
          className={`${inputClass} resize-none${pulseIfEmpty(!state.tech_stack.trim())}`}
        />
        <p className="text-xs text-muted-foreground mt-1">Linia = jedno narzędzie/technologia.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Doświadczenie od (lata)</label>
          <input
            type="number"
            min={0}
            value={state.experience_min_years ?? ""}
            onChange={(e) =>
              patch({ experience_min_years: e.target.value === "" ? null : Number(e.target.value) })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Doświadczenie do (lata)</label>
          <input
            type="number"
            min={0}
            value={state.experience_max_years ?? ""}
            onChange={(e) =>
              patch({ experience_max_years: e.target.value === "" ? null : Number(e.target.value) })
            }
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

export function wymaganiaSummary(state: JobEditorState): { mustsCount: number; nicesCount: number } {
  const splitLines = (s: string) => s.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  return {
    mustsCount: splitLines(state.must_haves).length,
    nicesCount: splitLines(state.nice_to_haves).length,
  };
}
