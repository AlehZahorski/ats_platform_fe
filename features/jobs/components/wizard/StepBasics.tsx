import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { PillSelector } from "@/shared/ui/PillSelector";
import type { WizardFormData } from "../../types/job-wizard.types";

interface StepBasicsProps {
  form: WizardFormData;
  onChange: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
}

const SENIORITY_OPTIONS = [
  { value: "junior", label: "Junior" },
  { value: "mid",    label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead",   label: "Lead" },
];

const WORK_MODE_OPTIONS = [
  { value: "remote",  label: "Zdalnie" },
  { value: "hybrid",  label: "Hybrydowo" },
  { value: "onsite",  label: "Stacjonarnie" },
];

const CONTRACT_OPTIONS = [
  { value: "employment", label: "Umowa o pracę" },
  { value: "b2b",        label: "B2B" },
  { value: "contract",   label: "Zlecenie" },
  { value: "internship", label: "Staż" },
  { value: "temporary",  label: "Tymczasowa" },
];

export function StepBasics({ form, onChange }: StepBasicsProps) {
  const showRemoteConstraints = form.work_mode === "remote" || form.work_mode === "hybrid";

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label>Tytuł stanowiska *</Label>
        <Input
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="np. Senior Backend Engineer"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Dział / Departament</Label>
          <Input
            value={form.department}
            onChange={(e) => onChange("department", e.target.value)}
            placeholder="np. Engineering"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Lokalizacja</Label>
          <Input
            value={form.location}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="np. Warszawa"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Poziom stanowiska</Label>
        <PillSelector
          options={SENIORITY_OPTIONS}
          value={form.seniority}
          onChange={(v) => onChange("seniority", v as WizardFormData["seniority"])}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Tryb pracy</Label>
        <PillSelector
          options={WORK_MODE_OPTIONS}
          value={form.work_mode}
          onChange={(v) => onChange("work_mode", v as WizardFormData["work_mode"])}
        />
      </div>

      {showRemoteConstraints && (
        <div className="space-y-1.5">
          <Label>Warunki pracy zdalnej</Label>
          <Input
            value={form.remote_constraints}
            onChange={(e) => onChange("remote_constraints", e.target.value)}
            placeholder="np. Do 3 dni zdalnie, 2 dni w biurze"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Rodzaj umowy</Label>
        <PillSelector
          options={CONTRACT_OPTIONS}
          value={form.contract_type}
          onChange={(v) => onChange("contract_type", v as WizardFormData["contract_type"])}
        />
      </div>
    </div>
  );
}
