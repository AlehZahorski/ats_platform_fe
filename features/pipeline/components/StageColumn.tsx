"use client";

import { useDroppable } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import type { ApplicationListItem, PipelineStage } from "@/types";
import { CandidateCard } from "./CandidateCard";

interface StageColumnProps {
  stage: PipelineStage;
  applications: ApplicationListItem[];
  index: number;
  totalStages: number;
  onMoveStage: (stageId: string, direction: -1 | 1) => void;
  onRenameStage: (id: string, currentName: string) => void;
  onDeleteStage: (id: string) => void;
}

export function StageColumn({
  stage, applications, index, totalStages,
  onMoveStage, onRenameStage, onDeleteStage,
}: StageColumnProps) {
  const t = useTranslations("pipeline");
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: "stage", stageId: stage.id },
  });

  return (
    <div className="w-72 shrink-0">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">{stage.name}</h3>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full inline-block mt-1">
            {applications.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMoveStage(stage.id, -1)}
            disabled={index === 0}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"
            title={t("moveLeft")}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMoveStage(stage.id, 1)}
            disabled={index === totalStages - 1}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"
            title={t("moveRight")}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRenameStage(stage.id, stage.name)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            title={t("rename")}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteStage(stage.id)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-24 rounded-xl p-2 transition-colors ${
          isOver ? "bg-primary/10 border border-primary/30" : "bg-muted/30 border border-transparent"
        }`}
      >
        {applications.map((app) => (
          <CandidateCard key={app.id} application={app} />
        ))}
        {applications.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">{t("noCandidates")}</p>
        )}
      </div>
    </div>
  );
}
