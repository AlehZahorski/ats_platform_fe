"use client";

import { useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import type {
  CompanyTimelineEntry,
  FaqEntry,
  HowWeWorkCard,
  MyCompany,
  RecruitmentStep,
} from "@/entities/company";
import { SectionShell } from "./SectionShell";

interface Props { company: MyCompany; }


// ─────────────────────────────────────────────────────────────────────
// Chip-list editor — for tech_stack and benefits. One input + Enter to add.
// ─────────────────────────────────────────────────────────────────────
function ChipListEditor({
  values, onChange, placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [text, setText] = useState("");
  const add = () => {
    const v = text.trim();
    if (!v) return;
    if (values.includes(v)) {
      setText("");
      return;
    }
    onChange([...values, v]);
    setText("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 text-sm">
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-muted-foreground hover:text-rose-400"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {values.length === 0 && (
          <span className="text-xs text-muted-foreground/70 italic">Brak elementów</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(); }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-accent/40 inline-flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Dodaj
        </button>
      </div>
    </div>
  );
}


// ── Tech stack ───────────────────────────────────────────────────────
export function TechStackSection({ company }: Props) {
  return (
    <SectionShell<{ tech_stack: string[] }>
      description="Technologie, których realnie używacie w pracy. Enter dodaje nowy chip."
      value={{ tech_stack: company.tech_stack }}
      buildPayload={(next) => ({ tech_stack: next.tech_stack })}
    >
      {(draft, setDraft) => (
        <ChipListEditor
          values={draft.tech_stack}
          onChange={(v) => setDraft({ tech_stack: v })}
          placeholder="np. TypeScript, React, PostgreSQL…"
        />
      )}
    </SectionShell>
  );
}


// ── Benefits ─────────────────────────────────────────────────────────
export function BenefitsSection({ company }: Props) {
  return (
    <SectionShell<{ benefits: string[] }>
      description="Lista bonusów oferowanych pracownikom. Każdy benefit jako osobny chip."
      value={{ benefits: company.benefits }}
      buildPayload={(next) => ({ benefits: next.benefits })}
    >
      {(draft, setDraft) => (
        <ChipListEditor
          values={draft.benefits}
          onChange={(v) => setDraft({ benefits: v })}
          placeholder="np. Karta Multisport, Budżet szkoleniowy 5 000 PLN…"
        />
      )}
    </SectionShell>
  );
}


// ─────────────────────────────────────────────────────────────────────
// Repeater editor — generic "add row / edit row / remove row" UI for
// structured JSONB sections. Each row is a horizontal stack of inputs.
// ─────────────────────────────────────────────────────────────────────
function RepeaterRow<T>({
  index, onRemove, children,
}: { index: number; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 space-y-2 relative">
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground/60 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">{children}</div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-muted-foreground hover:text-rose-400"
          aria-label={`Usuń wiersz ${index + 1}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


// ── How we work (icon / title / description cards) ──────────────────
export function HowWeWorkSection({ company }: Props) {
  return (
    <SectionShell<{ how_we_work: HowWeWorkCard[] }>
      description="Karty z ikoną, krótkim tytułem i opisem. Pokazują kulturę pracy. Nazwa ikony to nazwa z lucide-react (np. „rocket”, „compass”, „users”)."
      value={{ how_we_work: company.how_we_work }}
      buildPayload={(next) => ({ how_we_work: next.how_we_work })}
    >
      {(draft, setDraft) => (
        <div className="space-y-2">
          {draft.how_we_work.map((card, i) => (
            <RepeaterRow
              key={i}
              index={i}
              onRemove={() => setDraft({ how_we_work: draft.how_we_work.filter((_, j) => j !== i) })}
            >
              <div className="grid grid-cols-1 md:grid-cols-[120px_minmax(0,1fr)] gap-2">
                <input
                  value={card.icon}
                  onChange={(e) => {
                    const next = [...draft.how_we_work];
                    next[i] = { ...card, icon: e.target.value };
                    setDraft({ how_we_work: next });
                  }}
                  placeholder="rocket"
                  className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                />
                <input
                  value={card.title}
                  onChange={(e) => {
                    const next = [...draft.how_we_work];
                    next[i] = { ...card, title: e.target.value };
                    setDraft({ how_we_work: next });
                  }}
                  placeholder="Tytuł karty (np. Remote-first)"
                  className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                />
              </div>
              <textarea
                value={card.description}
                onChange={(e) => {
                  const next = [...draft.how_we_work];
                  next[i] = { ...card, description: e.target.value };
                  setDraft({ how_we_work: next });
                }}
                placeholder="Krótki opis (max 240 znaków)"
                rows={2}
                maxLength={240}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm mt-2"
              />
            </RepeaterRow>
          ))}
          <AddRowButton
            label="Dodaj kartę"
            onClick={() =>
              setDraft({
                how_we_work: [...draft.how_we_work, { icon: "sparkles", title: "", description: "" }],
              })
            }
          />
        </div>
      )}
    </SectionShell>
  );
}


// ── Recruitment process ──────────────────────────────────────────────
export function RecruitmentSection({ company }: Props) {
  return (
    <SectionShell<{ recruitment_process: RecruitmentStep[] }>
      description="Kroki, przez które przechodzi kandydat. Czas trwania (opcjonalny) np. „15 min”, „60 min”."
      value={{ recruitment_process: company.recruitment_process }}
      buildPayload={(next) => ({ recruitment_process: next.recruitment_process })}
    >
      {(draft, setDraft) => (
        <div className="space-y-2">
          {draft.recruitment_process.map((step, i) => (
            <RepeaterRow
              key={i}
              index={i}
              onRemove={() =>
                setDraft({ recruitment_process: draft.recruitment_process.filter((_, j) => j !== i) })
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_140px] gap-2">
                <input
                  value={step.name}
                  onChange={(e) => {
                    const next = [...draft.recruitment_process];
                    next[i] = { ...step, name: e.target.value };
                    setDraft({ recruitment_process: next });
                  }}
                  placeholder="Nazwa kroku (np. Rozmowa techniczna)"
                  className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                />
                <input
                  value={step.duration ?? ""}
                  onChange={(e) => {
                    const next = [...draft.recruitment_process];
                    next[i] = { ...step, duration: e.target.value || null };
                    setDraft({ recruitment_process: next });
                  }}
                  placeholder="Czas (opcj.)"
                  className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                />
              </div>
            </RepeaterRow>
          ))}
          <AddRowButton
            label="Dodaj krok"
            onClick={() =>
              setDraft({
                recruitment_process: [...draft.recruitment_process, { name: "", duration: null }],
              })
            }
          />
        </div>
      )}
    </SectionShell>
  );
}


// ── Timeline ─────────────────────────────────────────────────────────
export function TimelineSection({ company }: Props) {
  return (
    <SectionShell<{ timeline: CompanyTimelineEntry[] }>
      description="Kamienie milowe firmy. Pojawią się w sekcji „Oś czasu” na profilu publicznym."
      value={{ timeline: company.timeline }}
      buildPayload={(next) => ({ timeline: next.timeline })}
    >
      {(draft, setDraft) => (
        <div className="space-y-2">
          {draft.timeline.map((e, i) => (
            <RepeaterRow
              key={i}
              index={i}
              onRemove={() => setDraft({ timeline: draft.timeline.filter((_, j) => j !== i) })}
            >
              <div className="grid grid-cols-1 md:grid-cols-[100px_minmax(0,1fr)] gap-2">
                <input
                  type="number"
                  value={e.year}
                  onChange={(ev) => {
                    const next = [...draft.timeline];
                    next[i] = { ...e, year: parseInt(ev.target.value, 10) || e.year };
                    setDraft({ timeline: next });
                  }}
                  className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                />
                <input
                  value={e.title}
                  onChange={(ev) => {
                    const next = [...draft.timeline];
                    next[i] = { ...e, title: ev.target.value };
                    setDraft({ timeline: next });
                  }}
                  placeholder="Tytuł (np. Runda Series A)"
                  className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                />
              </div>
            </RepeaterRow>
          ))}
          <AddRowButton
            label="Dodaj wpis"
            onClick={() =>
              setDraft({
                timeline: [...draft.timeline, { year: new Date().getFullYear(), title: "" }],
              })
            }
          />
        </div>
      )}
    </SectionShell>
  );
}


// ── FAQ ──────────────────────────────────────────────────────────────
export function FaqSection({ company }: Props) {
  return (
    <SectionShell<{ faq: FaqEntry[] }>
      description="Lista pytań i odpowiedzi widoczna na dole profilu firmy."
      value={{ faq: company.faq }}
      buildPayload={(next) => ({ faq: next.faq })}
    >
      {(draft, setDraft) => (
        <div className="space-y-2">
          {draft.faq.map((item, i) => (
            <RepeaterRow
              key={i}
              index={i}
              onRemove={() => setDraft({ faq: draft.faq.filter((_, j) => j !== i) })}
            >
              <input
                value={item.question}
                onChange={(e) => {
                  const next = [...draft.faq];
                  next[i] = { ...item, question: e.target.value };
                  setDraft({ faq: next });
                }}
                placeholder="Pytanie"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-medium"
              />
              <textarea
                value={item.answer}
                onChange={(e) => {
                  const next = [...draft.faq];
                  next[i] = { ...item, answer: e.target.value };
                  setDraft({ faq: next });
                }}
                placeholder="Odpowiedź"
                rows={3}
                maxLength={2000}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm mt-2"
              />
            </RepeaterRow>
          ))}
          <AddRowButton
            label="Dodaj pytanie"
            onClick={() => setDraft({ faq: [...draft.faq, { question: "", answer: "" }] })}
          />
        </div>
      )}
    </SectionShell>
  );
}


function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-amber-400/60 hover:text-foreground inline-flex items-center justify-center gap-1.5"
    >
      <Plus className="w-4 h-4" /> {label}
    </button>
  );
}
