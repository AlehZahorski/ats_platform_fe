import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { RichTextEditor } from "@/shared/ui/RichTextEditor";
import type { WizardFormData } from "../../types/job-wizard.types";

interface StepConditionsProps {
  form: WizardFormData;
  onChange: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
}

const SALARY_PERIOD_OPTIONS = [
  { value: "month", label: "miesięcznie" },
  { value: "year",  label: "rocznie" },
  { value: "hour",  label: "za godzinę" },
];

const CURRENCY_OPTIONS = ["PLN", "EUR", "USD", "GBP", "CHF"];

export function StepConditions({ form, onChange }: StepConditionsProps) {
  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-3 block">Wynagrodzenie</Label>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Od (brutto)</Label>
            <Input
              type="number"
              min={0}
              value={form.salary_min}
              onChange={(e) => onChange("salary_min", e.target.value)}
              placeholder="np. 12000"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Do (brutto)</Label>
            <Input
              type="number"
              min={0}
              value={form.salary_max}
              onChange={(e) => onChange("salary_max", e.target.value)}
              placeholder="np. 18000"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Waluta</Label>
            <select
              value={form.salary_currency}
              onChange={(e) => onChange("salary_currency", e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Okres</Label>
            <select
              value={form.salary_period}
              onChange={(e) => onChange("salary_period", e.target.value as WizardFormData["salary_period"])}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Wybierz</option>
              {SALARY_PERIOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-amber-600 mt-2">
          ✦ Oferty z widełkami wynagrodzenia przyciągają średnio 3× więcej aplikacji
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Dlaczego warto tu pracować?</Label>
        <p className="text-xs text-muted-foreground">Wartość, którą dajesz pracownikowi — kultura, misja, wpływ</p>
        <RichTextEditor
          value={form.value_proposition}
          onChange={(v) => onChange("value_proposition", v)}
          placeholder="Budujemy produkt, który zmienia sposób rekrutacji w Polsce. Masz realny wpływ na architekturę..."
          minHeight={100}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Benefity</Label>
        <p className="text-xs text-muted-foreground">Co oferujesz kandydatowi poza wynagrodzeniem</p>
        <RichTextEditor
          value={form.benefits}
          onChange={(v) => onChange("benefits", v)}
          placeholder="Prywatna opieka medyczna, karta sportowa, budżet szkoleniowy..."
          minHeight={120}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Proces rekrutacji</Label>
        <p className="text-xs text-muted-foreground">Kandydaci cenią przejrzystość — opisz każdy etap</p>
        <RichTextEditor
          value={form.hiring_process}
          onChange={(v) => onChange("hiring_process", v)}
          placeholder="Rozmowa wstępna z HR, zadanie techniczne, rozmowa z zespołem..."
          minHeight={120}
        />
      </div>
    </div>
  );
}
