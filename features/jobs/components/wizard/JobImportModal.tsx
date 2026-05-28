"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Wand2, Loader2, FileText, Info } from "lucide-react";
import { toast } from "sonner";
import { jobsApi, type JobParseResult } from "@/services/api/jobs";
import type { JobEditorState } from "../../types/job-editor.types";
import type { ContractType, SalaryPeriod, Seniority, WorkMode } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onParsed: (changes: Partial<JobEditorState>) => void;
}

const MIN_LENGTH = 100;

export function JobImportModal({ open, onClose, onParsed }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (text.trim().length < MIN_LENGTH) {
      toast.error(`Wklej co najmniej ${MIN_LENGTH} znaków treści ogłoszenia`);
      return;
    }
    setLoading(true);
    try {
      const { data } = await jobsApi.parse(text);
      const changes = mapResultToEditorState(data);
      const extractedCount = Object.keys(changes).length;
      if (extractedCount === 0) {
        toast.warning("Nic nie udało się wyekstraktować z tej treści");
        return;
      }
      onParsed(changes);
      toast.success(`Wypełniono ${extractedCount} pól z wklejonej treści`);
      onClose();
      setText("");
    } catch {
      toast.error("Nie udało się przetworzyć tekstu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="px-6 pt-6 pr-12">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="w-5 h-5 text-amber-400" />
            Wklej istniejące ogłoszenie
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            AI strukturyzuje treść w pola formularza. Nie generuje nowego tekstu — tylko ekstrahuje to, co już jest.
          </p>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>
              Wklej np. starą ofertę z Worda, treść z Pracuj.pl, NoFluffJobs lub własnej strony karier.
              Im pełniejsza treść — tym dokładniejsza ekstrakcja.
            </span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            placeholder="Wklej tutaj pełną treść istniejącego ogłoszenia o pracę…"
            className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 resize-none font-mono"
            disabled={loading}
          />

          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              {text.length.toLocaleString("pl-PL")} znaków
              {text.length < MIN_LENGTH && text.length > 0 && (
                <span className="text-amber-500"> (min. {MIN_LENGTH})</span>
              )}
            </span>
            <span>Max 20 000 znaków</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleParse}
            disabled={loading || text.trim().length < MIN_LENGTH}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Strukturyzuję…
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Strukturyzuj ogłoszenie
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Map LLM-extracted result → partial editor state. Only non-empty
// fields are patched, so existing form content is preserved.
// ─────────────────────────────────────────────────────────────────────
function mapResultToEditorState(r: JobParseResult): Partial<JobEditorState> {
  const out: Partial<JobEditorState> = {};
  const setIfFilled = (key: keyof JobEditorState, value: string | null | undefined) => {
    if (value && value.trim().length > 0) (out as Record<string, unknown>)[key] = value;
  };

  setIfFilled("title", r.title);
  setIfFilled("department", r.department);
  setIfFilled("location", r.location);
  setIfFilled("role_summary", r.role_summary);
  setIfFilled("team_context", r.team_context);
  setIfFilled("value_proposition", r.value_proposition);
  setIfFilled("remote_constraints", r.remote_constraints);
  setIfFilled("responsibilities", r.responsibilities);
  setIfFilled("must_haves", r.must_haves);
  setIfFilled("nice_to_haves", r.nice_to_haves);
  setIfFilled("tech_stack", r.tech_stack);
  setIfFilled("benefits", r.benefits);
  setIfFilled("hiring_process", r.hiring_process);

  if (r.work_mode) out.work_mode = r.work_mode as WorkMode;
  if (r.contract_type) out.contract_type = r.contract_type as ContractType;
  if (r.seniority) out.seniority = r.seniority as Seniority;
  if (r.shift_system) out.shift_system = r.shift_system;
  if (r.employment_size) out.employment_size = r.employment_size;
  if (r.salary_min !== null && r.salary_min !== undefined) out.salary_min = r.salary_min;
  if (r.salary_max !== null && r.salary_max !== undefined) out.salary_max = r.salary_max;
  if (r.salary_currency) out.salary_currency = r.salary_currency;
  if (r.salary_period) out.salary_period = r.salary_period as SalaryPeriod;
  if (r.experience_min_years !== null && r.experience_min_years !== undefined)
    out.experience_min_years = r.experience_min_years;
  if (r.experience_max_years !== null && r.experience_max_years !== undefined)
    out.experience_max_years = r.experience_max_years;

  return out;
}
