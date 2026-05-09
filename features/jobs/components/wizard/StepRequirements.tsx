import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { RichTextEditor } from "@/shared/ui/RichTextEditor";
import type { WizardFormData } from "../../types/job-wizard.types";

interface StepRequirementsProps {
  form: WizardFormData;
  onChange: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void;
}

export function StepRequirements({ form, onChange }: StepRequirementsProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Wymagania obowiązkowe</Label>
        <p className="text-xs text-muted-foreground">Tylko to czego naprawdę potrzebujesz</p>
        <RichTextEditor
          value={form.must_haves}
          onChange={(v) => onChange("must_haves", v)}
          placeholder="Min. 3 lata doświadczenia z Pythonem, znajomość PostgreSQL..."
          minHeight={140}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Mile widziane</Label>
        <p className="text-xs text-muted-foreground">Atuty, ale nie dealbreakery</p>
        <RichTextEditor
          value={form.nice_to_haves}
          onChange={(v) => onChange("nice_to_haves", v)}
          placeholder="Znajomość FastAPI lub Django, doświadczenie z Docker..."
          minHeight={120}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Stack technologiczny</Label>
        <p className="text-xs text-muted-foreground">Główne technologie w projekcie</p>
        <RichTextEditor
          value={form.tech_stack}
          onChange={(v) => onChange("tech_stack", v)}
          placeholder="Python / FastAPI, PostgreSQL, Redis, Docker..."
          minHeight={120}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Doświadczenie — od (lat)</Label>
          <Input
            type="number"
            min={0}
            max={50}
            value={form.experience_min_years}
            onChange={(e) => onChange("experience_min_years", e.target.value)}
            placeholder="np. 2"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Doświadczenie — do (lat)</Label>
          <Input
            type="number"
            min={0}
            max={50}
            value={form.experience_max_years}
            onChange={(e) => onChange("experience_max_years", e.target.value)}
            placeholder="np. 5"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Profil idealnego kandydata</Label>
        <Textarea
          value={form.success_profile}
          onChange={(e) => onChange("success_profile", e.target.value)}
          rows={3}
          placeholder="np. Osoba samodzielna, z inicjatywą, lubiąca pracę z danymi i myślenie systemowe..."
        />
      </div>
    </div>
  );
}
