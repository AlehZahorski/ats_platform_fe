"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import * as Icons from "lucide-react";
import type {
  CompanyTimelineEntry,
  FaqEntry,
  HowWeWorkCard,
  RecruitmentStep,
} from "@/entities/company";

// ─────────────────────────────────────────────────────────────────────
// "Hide-if-empty" wrapper. The whole rule: if you have nothing to show,
// don't render a section header that says "empty". This wraps each
// optional section so the page logic stays declarative.
// ─────────────────────────────────────────────────────────────────────
function Section({
  title,
  show,
  children,
}: {
  title: string;
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}


// ── Jak pracujemy ────────────────────────────────────────────────────
function getLucideIcon(name: string) {
  const pascal = name
    .split(/[-_\s]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  return (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[pascal] ?? Icons.Sparkles;
}

export function HowWeWorkSection({ cards }: { cards: HowWeWorkCard[] }) {
  return (
    <Section title="Jak pracujemy" show={cards.length > 0}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c, i) => {
          const Icon = getLucideIcon(c.icon || "sparkles");
          return (
            <div key={i} className="rounded-xl border border-border bg-background p-4">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-medium text-sm">{c.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{c.description}</div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}


// ── Tech stack ───────────────────────────────────────────────────────
export function TechStackSection({ techs }: { techs: string[] }) {
  return (
    <Section title="Tech stack" show={techs.length > 0}>
      <div className="flex flex-wrap gap-2">
        {techs.map((t) => (
          <span
            key={t}
            className="px-3 py-1 rounded-md bg-muted/40 text-sm text-foreground/90"
          >
            {t}
          </span>
        ))}
      </div>
    </Section>
  );
}


// ── Oś czasu ─────────────────────────────────────────────────────────
export function TimelineSection({ entries }: { entries: CompanyTimelineEntry[] }) {
  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => a.year - b.year);
  return (
    <Section title="Oś czasu" show>
      <ol className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-y-6 gap-x-4">
        {sorted.map((entry, i) => (
          <li key={i} className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="text-sm font-semibold">{entry.year}</span>
            </div>
            <div className="text-xs text-muted-foreground">{entry.title}</div>
            {entry.description && (
              <div className="text-xs text-muted-foreground/70 mt-0.5">{entry.description}</div>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}


// ── Benefits ─────────────────────────────────────────────────────────
export function BenefitsSection({ benefits }: { benefits: string[] }) {
  return (
    <Section title="Benefity" show={benefits.length > 0}>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {benefits.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Icons.Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}


// ── Proces rekrutacji ────────────────────────────────────────────────
export function RecruitmentSection({ steps }: { steps: RecruitmentStep[] }) {
  return (
    <Section title="Proces rekrutacji" show={steps.length > 0}>
      <ol className="flex items-start gap-2 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-center text-center min-w-[110px]">
              <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-400 font-semibold flex items-center justify-center text-sm">
                {i + 1}
              </div>
              <div className="text-xs font-medium mt-2">{s.name}</div>
              {s.duration && <div className="text-[10px] text-muted-foreground">({s.duration})</div>}
            </div>
            {i < steps.length - 1 && <Icons.ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />}
          </li>
        ))}
      </ol>
    </Section>
  );
}


// ── FAQ ──────────────────────────────────────────────────────────────
export function FaqSection({ items }: { items: FaqEntry[] }) {
  if (items.length === 0) return null;
  return (
    <Section title="Najczęściej zadawane pytania" show>
      <div className="space-y-2">
        {items.map((item, i) => (
          <FaqRow key={i} item={item} />
        ))}
      </div>
    </Section>
  );
}

function FaqRow({ item }: { item: FaqEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium">{item.question}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground">{item.answer}</div>
      )}
    </div>
  );
}
