"use client";

import { QUICK_INDUSTRY_CHIPS, SIZE_BUCKETS } from "@/pages-ui/companies/lib/filters";
import type { MyCompany } from "@/entities/company";
import { SectionShell, TextField, Textarea } from "./SectionShell";

interface Props { company: MyCompany; }


// ── Identity & location ──────────────────────────────────────────────
interface IdentityState {
  industry: string | null;
  employee_count: number | null;
  hq_location: string | null;
  founded_year: number | null;
  remote_percentage: number | null;
}

export function IdentitySection({ company }: Props) {
  const state: IdentityState = {
    industry:           company.industry,
    employee_count:     company.employee_count,
    hq_location:        company.hq_location,
    founded_year:       company.founded_year,
    remote_percentage:  company.remote_percentage,
  };

  return (
    <SectionShell<IdentityState>
      description="Branża, lokalizacja, wielkość. Te informacje pojawiają się obok logo na profilu i jako chipy filtrów na liście firm."
      value={state}
      buildPayload={(next) => ({
        industry:          next.industry?.trim() || null,
        employee_count:    next.employee_count,
        hq_location:       next.hq_location?.trim() || null,
        founded_year:      next.founded_year,
        remote_percentage: next.remote_percentage,
      })}
    >
      {(draft, setDraft) => (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <div className="text-xs text-muted-foreground mb-1">Branża</div>
              <select
                value={draft.industry ?? ""}
                onChange={(e) => setDraft({ ...draft, industry: e.target.value || null })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              >
                <option value="">— wybierz —</option>
                {QUICK_INDUSTRY_CHIPS.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </label>
            <TextField
              label="Liczba pracowników"
              type="number"
              value={draft.employee_count}
              onChange={(v) =>
                setDraft({ ...draft, employee_count: v ? parseInt(v, 10) : null })
              }
              placeholder="120"
            />
            <TextField
              label="Siedziba (HQ)"
              value={draft.hq_location}
              onChange={(v) => setDraft({ ...draft, hq_location: v })}
              placeholder="Warszawa, Polska"
              maxLength={200}
            />
            <TextField
              label="Rok założenia"
              type="number"
              value={draft.founded_year}
              onChange={(v) =>
                setDraft({ ...draft, founded_year: v ? parseInt(v, 10) : null })
              }
              placeholder="2019"
            />
            <TextField
              label="% pracy zdalnej (0–100)"
              type="number"
              value={draft.remote_percentage}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  remote_percentage: v ? Math.max(0, Math.min(100, parseInt(v, 10))) : null,
                })
              }
              placeholder="85"
            />
          </div>
        </>
      )}
    </SectionShell>
  );
}


// ── Description ──────────────────────────────────────────────────────
export function DescriptionSection({ company }: Props) {
  return (
    <SectionShell<{ description: string | null }>
      description="Dłuższy akapit. Pojawi się pod tagline na profilu publicznym."
      value={{ description: company.description }}
      buildPayload={(next) => ({ description: next.description?.trim() || null })}
    >
      {(draft, setDraft) => (
        <Textarea
          label="Opis"
          value={draft.description}
          onChange={(v) => setDraft({ description: v })}
          rows={5}
          maxLength={4000}
          placeholder="Krótki opis firmy — czym się zajmujecie, jaką misję realizujecie, co Was wyróżnia."
        />
      )}
    </SectionShell>
  );
}
