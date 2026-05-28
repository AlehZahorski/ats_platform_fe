import type { MyCompany } from "@/entities/company";

// Mirror of features/jobs/components/wizard/lib/completeness.ts — same status
// taxonomy so we can re-use SectionCard / WizardStepper without translation.

export type SectionStatus = "empty" | "needs-attention" | "complete";

export interface ProgressResult {
  progress: number;     // 0–100, drives the mini bar in stepper
  missing: string[];    // shown as tooltip on hover
}

const ratio = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));


// ─────────────────────────────────────────────────────────────────────
// Sections
// ─────────────────────────────────────────────────────────────────────

/** Brand basics — name (always present), slug, logo, banner, tagline, website. */
export function brandProgress(c: MyCompany): ProgressResult {
  const checks = [
    { ok: !!c.name && c.name.trim().length > 0, label: "Nazwa firmy" },
    { ok: !!c.slug,        label: "Adres URL (slug)" },
    { ok: !!c.logo_url,    label: "Logo" },
    { ok: !!c.banner_url,  label: "Banner" },
    { ok: !!c.tagline,     label: "Tagline" },
    { ok: !!c.website,     label: "Strona WWW" },
  ];
  const passed = checks.filter((c) => c.ok).length;
  return { progress: ratio(passed, checks.length), missing: checks.filter((c) => !c.ok).map((c) => c.label) };
}

export function identityProgress(c: MyCompany): ProgressResult {
  const checks = [
    { ok: !!c.industry,                       label: "Branża" },
    { ok: c.employee_count != null,           label: "Liczba pracowników" },
    { ok: !!c.hq_location,                    label: "Siedziba" },
    { ok: c.founded_year != null,             label: "Rok założenia" },
    { ok: c.remote_percentage != null,        label: "Procent pracy zdalnej" },
  ];
  const passed = checks.filter((c) => c.ok).length;
  return { progress: ratio(passed, checks.length), missing: checks.filter((c) => !c.ok).map((c) => c.label) };
}

export function descriptionProgress(c: MyCompany): ProgressResult {
  const len = (c.description ?? "").trim().length;
  if (len === 0) return { progress: 0, missing: ["Opis firmy"] };
  if (len < 100) return { progress: 50, missing: ["Opis za krótki (min. 100 znaków)"] };
  return { progress: 100, missing: [] };
}

export function howWeWorkProgress(c: MyCompany): ProgressResult {
  const n = c.how_we_work.length;
  if (n === 0) return { progress: 0, missing: ["Karty „Jak pracujemy”"] };
  if (n < 3)   return { progress: 50, missing: [`Dodaj jeszcze ${3 - n} karty (zalecane 3+)`] };
  return { progress: 100, missing: [] };
}

export function techStackProgress(c: MyCompany): ProgressResult {
  const n = c.tech_stack.length;
  if (n === 0) return { progress: 0, missing: ["Tech stack"] };
  if (n < 3)   return { progress: 50, missing: ["Dodaj jeszcze kilka technologii"] };
  return { progress: 100, missing: [] };
}

export function timelineProgress(c: MyCompany): ProgressResult {
  const n = c.timeline.length;
  if (n === 0) return { progress: 0, missing: ["Oś czasu"] };
  if (n < 2)   return { progress: 50, missing: ["Dodaj jeszcze jeden wpis"] };
  return { progress: 100, missing: [] };
}

export function benefitsProgress(c: MyCompany): ProgressResult {
  const n = c.benefits.length;
  if (n === 0) return { progress: 0, missing: ["Benefity"] };
  if (n < 3)   return { progress: 50, missing: ["Dodaj jeszcze kilka benefitów"] };
  return { progress: 100, missing: [] };
}

export function recruitmentProgress(c: MyCompany): ProgressResult {
  const n = c.recruitment_process.length;
  if (n === 0) return { progress: 0, missing: ["Proces rekrutacji"] };
  if (n < 2)   return { progress: 50, missing: ["Dodaj jeszcze jeden krok"] };
  return { progress: 100, missing: [] };
}

export function faqProgress(c: MyCompany): ProgressResult {
  const n = c.faq.length;
  if (n === 0) return { progress: 0, missing: ["FAQ"] };
  if (n < 3)   return { progress: 50, missing: ["Dodaj jeszcze parę pytań (zalecane 3+)"] };
  return { progress: 100, missing: [] };
}

export function galleryProgress(c: MyCompany): ProgressResult {
  const n = c.gallery.length;
  if (n === 0) return { progress: 0, missing: ["Zdjęcia"] };
  if (n < 3)   return { progress: 50, missing: ["Dodaj jeszcze kilka zdjęć"] };
  return { progress: 100, missing: [] };
}


// ─────────────────────────────────────────────────────────────────────
// Status helpers — translate progress + presence into the trichotomy
// the stepper/badge use.
// ─────────────────────────────────────────────────────────────────────

export function progressToStatus(p: ProgressResult): SectionStatus {
  if (p.progress === 0) return "empty";
  if (p.progress < 100) return "needs-attention";
  return "complete";
}

export function statusLabel(status: SectionStatus): string {
  if (status === "complete") return "Kompletne";
  if (status === "needs-attention") return "Wymaga uwagi";
  return "Nie uzupełniono";
}

export function statusBadgeClasses(status: SectionStatus): string {
  if (status === "complete") return "bg-emerald-500/15 text-emerald-500";
  if (status === "needs-attention") return "bg-amber-500/15 text-amber-500";
  return "bg-muted text-muted-foreground";
}


// ─────────────────────────────────────────────────────────────────────
// Convenience: full step list for the stepper.
// ─────────────────────────────────────────────────────────────────────

export const SECTION_DEFS = [
  { id: "brand",       label: "Identyfikacja",     hint: "Logo, banner, nazwa i adres URL",      progress: brandProgress },
  { id: "identity",    label: "Profil firmy",      hint: "Branża, lokalizacja, wielkość",        progress: identityProgress },
  { id: "description", label: "Opis",              hint: "Akapit pod tagline",                    progress: descriptionProgress },
  { id: "howWeWork",   label: "Jak pracujemy",     hint: "Karty kultury pracy",                   progress: howWeWorkProgress },
  { id: "techStack",   label: "Tech stack",        hint: "Technologie używane w firmie",          progress: techStackProgress },
  { id: "timeline",    label: "Oś czasu",          hint: "Kamienie milowe firmy",                 progress: timelineProgress },
  { id: "benefits",    label: "Benefity",          hint: "Co oferujecie pracownikom",             progress: benefitsProgress },
  { id: "recruitment", label: "Proces rekrutacji", hint: "Kroki, przez które przechodzi kandydat", progress: recruitmentProgress },
  { id: "faq",         label: "FAQ",               hint: "Najczęstsze pytania",                   progress: faqProgress },
  { id: "gallery",     label: "Galeria",           hint: "Zdjęcia biura i zespołu",               progress: galleryProgress },
] as const;

export type SectionId = (typeof SECTION_DEFS)[number]["id"];
