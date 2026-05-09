"use client";

import { useRef } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { RichTextEditor } from "@/shared/ui/RichTextEditor";
import { useJobSuggest } from "@/services/queries";
import type { WizardFormData } from "../../types/job-wizard.types";

interface StepDescriptionProps {
  jobId: string | null;
  form: WizardFormData;
  onChange: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
}

export function StepDescription({ jobId, form, onChange }: StepDescriptionProps) {
  const suggestUsed = useRef(false);
  const suggest = useJobSuggest();

  const handleSuggest = async () => {
    if (!jobId) return;
    try {
      const result = await suggest.mutateAsync(jobId);
      suggestUsed.current = true;
      if (result.role_summary)      onChange("role_summary",      result.role_summary);
      if (result.role_purpose)      onChange("role_purpose",      result.role_purpose);
      if (result.responsibilities)  onChange("responsibilities",  result.responsibilities);
      if (result.team_context)      onChange("team_context",      result.team_context);
      if (result.success_profile)   onChange("success_profile",   result.success_profile);
      if (result.must_haves)        onChange("must_haves",        result.must_haves);
      if (result.nice_to_haves)     onChange("nice_to_haves",     result.nice_to_haves);
      if (result.tech_stack)        onChange("tech_stack",        result.tech_stack);
      if (result.value_proposition) onChange("value_proposition", result.value_proposition);
      if (result.benefits)          onChange("benefits",          result.benefits);
      if (result.hiring_process)    onChange("hiring_process",    result.hiring_process);
      toast.success("AI wypełnił propozycję — sprawdź i dostosuj do swoich potrzeb.");
    } catch {
      toast.error("Generowanie nie powiodło się. Spróbuj ponownie.");
    }
  };

  return (
    <div className="space-y-5">
      {/* AI suggest — visible only if not yet used */}
      {!suggestUsed.current && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">Wygeneruj propozycję AI</p>
            <p className="text-xs text-muted-foreground">
              Claude wypełni wszystkie pola na podstawie tytułu i kontekstu oferty
            </p>
          </div>
          <button
            type="button"
            onClick={handleSuggest}
            disabled={suggest.isPending || !jobId}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 shrink-0 ml-4"
          >
            {suggest.isPending ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Generuję...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Zaciągnij przykład
              </>
            )}
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Krótki opis roli</Label>
        <p className="text-xs text-muted-foreground">3–5 zdań — co kandydat zobaczy jako pierwsze</p>
        <Textarea
          value={form.role_summary}
          onChange={(e) => onChange("role_summary", e.target.value)}
          rows={3}
          placeholder="np. Szukamy doświadczonego inżyniera backendu, który dołączy do naszego zespołu produktowego..."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Cel stanowiska</Label>
        <p className="text-xs text-muted-foreground">Dlaczego ta rola istnieje? Co zmieni się dzięki tej osobie?</p>
        <Textarea
          value={form.role_purpose}
          onChange={(e) => onChange("role_purpose", e.target.value)}
          rows={2}
          placeholder="np. Zapewnienie stabilności i skalowalności naszej platformy SaaS..."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Zakres obowiązków</Label>
        <p className="text-xs text-muted-foreground">Opisz główne zadania na tym stanowisku</p>
        <RichTextEditor
          value={form.responsibilities}
          onChange={(v) => onChange("responsibilities", v)}
          placeholder="Projektowanie i rozwijanie API REST, code review, współpraca z zespołem..."
          minHeight={160}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Kontekst zespołu</Label>
          <Textarea
            value={form.team_context}
            onChange={(e) => onChange("team_context", e.target.value)}
            rows={3}
            placeholder="np. Dołączysz do 6-osobowego zespołu backend, pracującego w metodologii Scrum..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>Raportowanie do</Label>
          <Input
            value={form.reporting_to}
            onChange={(e) => onChange("reporting_to", e.target.value)}
            placeholder="np. CTO / Lead Engineer"
          />
          <Label className="mt-3 block">Kontekst domenowy</Label>
          <Input
            value={form.domain_context}
            onChange={(e) => onChange("domain_context", e.target.value)}
            placeholder="np. Fintech, e-commerce, healthcare"
          />
        </div>
      </div>
    </div>
  );
}
