"use client";

import { useState } from "react";
import { Check, ExternalLink, Eye, LoaderCircle, MoreVertical, Save, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";
import { useJobEditor } from "../../hooks/useJobEditor";
import type { EditorMode } from "../../types/job-editor.types";

import { WizardStepper, type StepDefinition } from "./WizardStepper";
import { SectionCard } from "./SectionCard";
import { LivePreview, LivePreviewDialog } from "./LivePreview";
import { AiAnalysisModal } from "./AiAnalysisModal";
import { PublishChecklistModal } from "./PublishChecklistModal";
import { JobImportModal } from "./JobImportModal";

import { PodstawyStep, podstawySummary } from "./sections/PodstawyStep";
import { ZakresRoliStep, zakresRoliSummary } from "./sections/ZakresRoliStep";
import { WymaganiaStep, wymaganiaSummary } from "./sections/WymaganiaStep";
import { WidelkiStep, widelkiSummary } from "./sections/WidelkiStep";
import { PublikacjaStep, publikacjaSummary } from "./sections/PublikacjaStep";

import {
  podstawyStatus,
  zakresRoliStatus,
  wymaganiaStatus,
  widelkiStatus,
  publikacjaStatus,
  podstawyProgress,
  zakresRoliProgress,
  wymaganiaProgress,
  widelkiProgress,
  publikacjaProgress,
} from "./lib/completeness";

interface Props {
  mode: EditorMode;
  jobId?: string;
}

export function CreateJobWizard({ mode, jobId: initialJobId }: Props) {
  const editor = useJobEditor({ mode, jobId: initialJobId });

  const [activeIndex, setActiveIndex] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const stepIdToIndex: Record<string, number> = {
    podstawy: 0, zakres: 1, wymagania: 2, widelki: 3, publikacja: 4,
  };

  if (editor.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const { state, patch, job, jobId } = editor;
  const currentTemplateId =
    (job as { form_template_id?: string | null } | null)?.form_template_id ?? null;
  const currentTemplateName =
    (job as { form_template?: { name?: string | null } | null } | null)?.form_template?.name ?? null;

  const pPod = podstawyProgress(state);
  const pZak = zakresRoliProgress(state);
  const pWym = wymaganiaProgress(state);
  const pWid = widelkiProgress(state);
  const pPub = publikacjaProgress(state);

  const steps: StepDefinition[] = [
    { id: "podstawy",   label: "Podstawy",          hint: "Stanowisko, lokalizacja, tryb pracy",      status: podstawyStatus(state),   progress: pPod.progress, missing: pPod.missing },
    { id: "zakres",     label: "Zakres roli",       hint: "Opis roli i obowiązki",                    status: zakresRoliStatus(state), progress: pZak.progress, missing: pZak.missing },
    { id: "wymagania",  label: "Wymagania",         hint: "Umiejętności i doświadczenie",             status: wymaganiaStatus(state),  progress: pWym.progress, missing: pWym.missing },
    { id: "widelki",    label: "Widełki i benefity",hint: "Wynagrodzenie i korzyści",                 status: widelkiStatus(state),    progress: pWid.progress, missing: pWid.missing },
    { id: "publikacja", label: "Publikacja",        hint: "Status i formularz aplikacyjny",           status: publikacjaStatus(state), progress: pPub.progress, missing: pPub.missing },
  ];

  const handlePublish = async () => {
    // editor.publish() already shows the success/failure toast — don't double-fire it here.
    await editor.publish();
    setPublishOpen(false);
  };

  const handleJumpTo = (sectionId: string) => {
    const idx = stepIdToIndex[sectionId];
    if (idx !== undefined) setActiveIndex(idx);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <WizardHeader
        title={state.title}
        status={state.status}
        lastSavedAt={editor.lastSavedAt}
        isSaving={editor.isSaving}
        hasChanges={editor.hasChanges}
        canPublish={!!jobId && state.title.trim().length > 0}
        onPublish={() => setPublishOpen(true)}
        onSave={editor.saveDraft}
        publicHref={jobId ? `${ROUTES.public.jobs}?job=${jobId}` : null}
        showAiButton={!!jobId}
        onOpenAi={() => setAiOpen(true)}
      />

      <AiAnalysisModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        job={job}
        jobId={jobId}
      />

      {/*
        Grid layout — three breakpoints:
        - Default (mobile): single column, preview hidden (accessible via floating button → modal)
        - lg (1024+): two columns (stepper + sections), preview still hidden (still modal)
        - xl (1280+): three columns, all three sit flush together with no gaps:
          • stepper:  fixed 240px
          • sections: 1fr — fills all remaining space between stepper and preview
          • preview:  clamp(420px, 32vw, 1100px) — scales with viewport, capped on huge screens
      */}
      <div
        className="flex-1 px-6 py-6 grid gap-6
                   grid-cols-1
                   lg:grid-cols-[240px_minmax(0,1fr)]
                   xl:grid-cols-[240px_minmax(0,1fr)_clamp(420px,32vw,1100px)]"
      >
        {/* Left: stepper + import shortcut (create mode only) */}
        <div className="space-y-4">
          {mode === "create" && (
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="w-full flex items-start gap-3 px-3 py-3 rounded-lg border border-dashed border-amber-400/40 bg-amber-400/5 hover:bg-amber-400/10 text-left transition-colors"
            >
              <Wand2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">Wklej istniejące ogłoszenie</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  AI strukturyzuje treść w formularz
                </div>
              </div>
            </button>
          )}
          <WizardStepper steps={steps} activeIndex={activeIndex} onSelect={setActiveIndex} />
        </div>

        {/* Center: sections — fill the entire column (no inner cap) so columns sit flush together */}
        <div className="space-y-4 min-w-0 w-full">
          <SectionCard
            number={1}
            title="Podstawy"
            status={steps[0].status}
            defaultExpanded={activeIndex === 0}
            key={`s0-${activeIndex === 0}`}
            summary={podstawySummary(state)}
            onExpand={() => setActiveIndex(0)}
          >
            <PodstawyStep state={state} patch={patch} />
          </SectionCard>

          <SectionCard
            number={2}
            title="Zakres roli"
            status={steps[1].status}
            defaultExpanded={activeIndex === 1}
            key={`s1-${activeIndex === 1}`}
            summary={zakresRoliSummary(state)}
            onExpand={() => setActiveIndex(1)}
          >
            <ZakresRoliStep state={state} patch={patch} />
          </SectionCard>

          <SectionCard
            number={3}
            title="Wymagania"
            status={steps[2].status}
            defaultExpanded={activeIndex === 2}
            key={`s2-${activeIndex === 2}`}
            summary={(() => {
              const { mustsCount, nicesCount } = wymaganiaSummary(state);
              if (mustsCount === 0 && nicesCount === 0) return "Brak danych";
              return `${mustsCount} wymagane · ${nicesCount} mile widziane`;
            })()}
            onExpand={() => setActiveIndex(2)}
          >
            <WymaganiaStep state={state} patch={patch} />
          </SectionCard>

          <SectionCard
            number={4}
            title="Widełki i benefity"
            status={steps[3].status}
            defaultExpanded={activeIndex === 3}
            key={`s3-${activeIndex === 3}`}
            summary={widelkiSummary(state)}
            onExpand={() => setActiveIndex(3)}
          >
            <WidelkiStep state={state} patch={patch} />
          </SectionCard>

          <SectionCard
            number={5}
            title="Publikacja"
            status={steps[4].status}
            defaultExpanded={activeIndex === 4}
            key={`s4-${activeIndex === 4}`}
            summary={publikacjaSummary(state, currentTemplateName)}
            onExpand={() => setActiveIndex(4)}
          >
            <PublikacjaStep
              state={state}
              patch={patch}
              jobId={jobId}
              currentTemplateId={currentTemplateId}
            />
          </SectionCard>
        </div>

        {/* Right: live preview */}
        <LivePreview state={state} />
      </div>

      <PublishChecklistModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={handlePublish}
        state={state}
        onJumpTo={handleJumpTo}
        isPublishing={editor.isSaving}
      />

      <JobImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onParsed={(changes) => patch(changes)}
      />

      {/* Floating preview button — only when the inline preview column is hidden (<xl) */}
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="xl:hidden fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-amber-400 text-black text-sm font-semibold shadow-lg hover:bg-amber-300 transition-colors"
        title="Podgląd oferty"
      >
        <Eye className="w-4 h-4" />
        Podgląd
      </button>

      <LivePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        state={state}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Custom header (mockup-aligned: title + status badge + autosave + actions)
// ──────────────────────────────────────────────────────────────────────
interface HeaderProps {
  title: string;
  status: string;
  lastSavedAt: Date | null;
  isSaving: boolean;
  hasChanges: boolean;
  canPublish: boolean;
  onPublish: () => void;
  onSave: () => void;
  /** Public offer URL on the job board, or null when the job isn't saved yet. */
  publicHref: string | null;
  showAiButton?: boolean;
  onOpenAi?: () => void;
}

function WizardHeader({
  title,
  status,
  lastSavedAt,
  isSaving,
  hasChanges,
  canPublish,
  onPublish,
  onSave,
  publicHref,
  showAiButton,
  onOpenAi,
}: HeaderProps) {
  const statusLabel =
    status === "draft" ? "Szkic" : status === "open" ? "Opublikowana" : "Zamknięta";

  const autoSaveMin = lastSavedAt
    ? Math.max(0, Math.round((Date.now() - lastSavedAt.getTime()) / 60000))
    : null;

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold truncate">{title || "Nowa oferta pracy"}</h1>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                status === "draft" && "bg-muted text-muted-foreground",
                status === "open" && "bg-emerald-500/15 text-emerald-500",
                status === "closed" && "bg-rose-500/15 text-rose-500"
              )}
            >
              <Sparkles className="inline w-3 h-3 mr-1" />
              {statusLabel}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            {isSaving ? (
              <>
                <LoaderCircle className="w-3 h-3 animate-spin" />
                Zapisywanie…
              </>
            ) : hasChanges ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Niezapisane zmiany
              </>
            ) : autoSaveMin !== null ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                Zapisano automatycznie{autoSaveMin > 0 ? ` ${autoSaveMin} min temu` : " przed chwilą"}
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-muted-foreground" />
                Autosave włączony
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showAiButton && (
            <button
              type="button"
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-400/40 bg-amber-400/5 text-amber-400 text-sm font-medium hover:bg-amber-400/10 transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              Analiza AI
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Zapisz
          </button>
          {status === "open" && publicHref ? (
            <a
              href={publicHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent/40 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Przejdź do oferty
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Opublikuj ofertę, aby otworzyć ją na tablicy ofert"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm font-medium opacity-50 cursor-not-allowed"
            >
              <ExternalLink className="w-4 h-4" />
              Przejdź do oferty
            </button>
          )}
          <button
            type="button"
            onClick={onPublish}
            disabled={!canPublish}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Opublikuj ofertę
          </button>
          {/* Dead-end "kebab" menu removed — no onClick, no dropdown wired,
              clicks were silent. Re-add when there are real actions to put
              here (Duplicate, Archive, Export PDF, Share link). */}
        </div>
      </div>
    </div>
  );
}
