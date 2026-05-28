"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { useAnalyzeJob, useAssessRisk } from "@/services/queries";
import { useJobEditor } from "../../hooks/useJobEditor";
import type { EditorMode } from "../../types/job-editor.types";

import { EditorHeader } from "./EditorHeader";
import { EditorActions } from "./EditorActions";
import { AiSuggestCard } from "./AiSuggestCard";
import { CollapsibleSection } from "./shared/CollapsibleSection";
import { VisibilityFilter, type ViewMode } from "./shared/VisibilityFilter";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { RoleContextSection } from "./sections/RoleContextSection";
import { RequirementsSection } from "./sections/RequirementsSection";
import { RiskItemsSection } from "./sections/RiskItemsSection";
import { CompensationSection } from "./sections/CompensationSection";
import { SummarySection } from "./sections/SummarySection";
import { RiskAssessmentPanel } from "./risk-panel/RiskAssessmentPanel";
import { AttractivenessPanel } from "./attractiveness-panel/AttractivenessPanel";
import { JobPreviewModal } from "./preview/JobPreviewModal";

interface JobEditorProps {
  mode: EditorMode;
  jobId?: string;
}

/**
 * Top-level editor layout. Holds the form state via `useJobEditor` and
 * lays out:
 *   • EditorHeader      — breadcrumb + autosave indicator
 *   • Left column       — 6 collapsible sections (filled in Phase 4)
 *   • Right column      — AI risk panel    (filled in Phase 5)
 *   • EditorActions     — sticky bottom bar with 3 buttons
 *
 * Sections receive `state`/`patch` from the editor and don't need to
 * know about API calls — they are dumb controlled inputs.
 */
export function JobEditor({ mode, jobId: initialJobId }: JobEditorProps) {
  const t = useTranslations("jobs");
  const editor = useJobEditor({ mode, jobId: initialJobId });

  if (editor.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const sectionTitle = (key: string) => t(`editor.sections.${key}.title` as never);
  const { state, patch, jobId, job } = editor;
  const assessRisk = useAssessRisk();
  const analyze = useAnalyzeJob();
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Returns true if a section with given visibility should render under viewMode.
  // Binary classification — every section is either public (job board) or internal (HR only).
  const showSection = (vis: "public" | "internal"): boolean => {
    if (viewMode === "all") return true;
    if (viewMode === "candidate") return vis === "public";
    return vis === "internal"; // recruiter
  };

  // AI panels are paid HR tooling — never visible in candidate view.
  const showAiPanels = viewMode !== "candidate";

  // Bottom "Refresh AI" button → re-runs both analyses in parallel.
  const handlePreviewAi = async () => {
    if (!jobId) return;
    const results = await Promise.allSettled([
      assessRisk.mutateAsync(jobId),
      analyze.mutateAsync(jobId),
    ]);
    if (results.every((r) => r.status === "rejected")) {
      toast.error(t("riskPanel.failed"));
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <EditorHeader
        title={state.title}
        status={state.status}
        lastSavedAt={editor.lastSavedAt}
        isSaving={editor.isSaving}
        hasChanges={editor.hasChanges}
        onPreview={() => setPreviewOpen(true)}
      />

      <div className="flex-1 px-6 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_clamp(340px,34%,680px)] gap-6">
        {/* ── Left column: visibility filter + form sections ──────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("visibility.filterLabel")}
            </p>
            <VisibilityFilter value={viewMode} onChange={setViewMode} />
          </div>

          <AiSuggestCard
            jobId={jobId}
            suggestUsedAt={job?.suggest_used_at ?? null}
            patch={patch}
          />

          {showSection("public") && (
            <CollapsibleSection number={1} title={sectionTitle("basic")} visibility="public">
              <BasicInfoSection state={state} patch={patch} />
            </CollapsibleSection>
          )}

          {showSection("internal") && (
            <CollapsibleSection number={2} title={sectionTitle("context")} visibility="internal">
              <RoleContextSection state={state} patch={patch} />
            </CollapsibleSection>
          )}

          {showSection("public") && (
            <CollapsibleSection number={3} title={sectionTitle("requirements")} visibility="public">
              <RequirementsSection state={state} patch={patch} />
            </CollapsibleSection>
          )}

          {showSection("internal") && (
            <CollapsibleSection number={4} title={sectionTitle("risks")} visibility="internal" defaultOpen={false}>
              <RiskItemsSection
                jobId={jobId}
                riskItems={job?.risk_items ?? []}
                mitigations={job?.mitigation_actions ?? []}
              />
            </CollapsibleSection>
          )}

          {showSection("public") && (
            <CollapsibleSection number={5} title={sectionTitle("compensation")} visibility="public" defaultOpen={false}>
              <CompensationSection state={state} patch={patch} />
            </CollapsibleSection>
          )}

          {showSection("public") && (
            <CollapsibleSection number={6} title={sectionTitle("summary")} visibility="public" defaultOpen={false}>
              <SummarySection state={state} patch={patch} />
            </CollapsibleSection>
          )}
        </div>

        {/* ── Right column: AI panels (HR-only, paid tooling) ─────
            Attractiveness comes first — primary signal for recruiters
            (how candidates will perceive the offer). Risk assessment is
            secondary, organisational-side perspective.
            Hidden entirely in candidate view (candidates do not pay).  */}
        {showAiPanels && (
          <aside className="lg:sticky lg:top-20 lg:self-start space-y-4">
            <AttractivenessPanel
              jobId={jobId}
              analysis={job?.analysis ?? null}
              publishReady={job?.publish_ready ?? false}
              publishIssues={job?.publish_issues ?? []}
            />
            <RiskAssessmentPanel jobId={jobId} assessment={job?.risk_assessment ?? null} />
          </aside>
        )}
      </div>

      <EditorActions
        isSaving={editor.isSaving || assessRisk.isPending || analyze.isPending}
        canPublish={editor.state.title.trim().length > 0 && !!jobId}
        onSaveDraft={editor.saveDraft}
        onPreviewAi={handlePreviewAi}
        onPublish={editor.publish}
      />

      {previewOpen && (
        <JobPreviewModal state={state} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}
