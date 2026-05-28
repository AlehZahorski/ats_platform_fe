"use client";

import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Sparkles } from "lucide-react";
import { AttractivenessPanel } from "../editor/attractiveness-panel/AttractivenessPanel";
import { RiskAssessmentPanel } from "../editor/risk-panel/RiskAssessmentPanel";
import { RiskItemsSection } from "../editor/sections/RiskItemsSection";
import type { Job } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  jobId: string | null;
}

export function AiAnalysisModal({ open, onClose, job, jobId }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Analiza AI
          </DialogTitle>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 overflow-y-auto max-h-[calc(90vh-64px)]">
          {/* Lewa: atrakcyjność oferty */}
          <AttractivenessPanel
            jobId={jobId}
            analysis={job?.analysis ?? null}
            publishReady={job?.publish_ready ?? false}
            publishIssues={job?.publish_issues ?? []}
          />

          {/* Prawa: ryzyko + mitigations */}
          <div className="space-y-4">
            <RiskAssessmentPanel
              jobId={jobId}
              assessment={job?.risk_assessment ?? null}
            />
            <div className="border border-border rounded-xl bg-card p-4">
              <h3 className="text-sm font-semibold mb-3">Ryzyka i mitigacje</h3>
              <RiskItemsSection
                jobId={jobId}
                riskItems={job?.risk_items ?? []}
                mitigations={job?.mitigation_actions ?? []}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
