"use client";

import { useMemo, useState } from "react";
import { DndContext, type DragEndEvent, closestCenter, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import {
  useApplications,
  useCreatePipelineStage,
  useDeletePipelineStage,
  usePipelineStages,
  useReorderPipelineStages,
  useUpdateStage,
  useUpdatePipelineStage,
} from "@/services/queries";
import { formatRelative } from "@/lib/utils";
import type { ApplicationListItem, PipelineStage } from "@/types";

function CandidateCard({ application }: { application: ApplicationListItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    data: {
      type: "application",
      applicationId: application.id,
      stageId: application.stage?.id ?? null,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-card border border-border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all touch-none"
    >
      <p className="font-medium text-sm text-foreground">
        {application.first_name} {application.last_name}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{application.email}</p>
      <p className="text-xs text-muted-foreground mt-1">{formatRelative(application.created_at)}</p>
    </div>
  );
}

function StageColumn({
  stage,
  applications,
  index,
  totalStages,
  onMoveStage,
  onRenameStage,
  onDeleteStage,
}: {
  stage: PipelineStage;
  applications: ApplicationListItem[];
  index: number;
  totalStages: number;
  onMoveStage: (stageId: string, direction: -1 | 1) => void;
  onRenameStage: (id: string, currentName: string) => void;
  onDeleteStage: (id: string) => void;
}) {
  const t = useTranslations("pipeline");
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: {
      type: "stage",
      stageId: stage.id,
    },
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
        {applications.map((application) => (
          <CandidateCard key={application.id} application={application} />
        ))}
        {applications.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">{t("noCandidates")}</p>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const t = useTranslations("pipeline");
  const { data: stages } = usePipelineStages();
  const { data: appsData } = useApplications();
  const updateStage = useUpdateStage();
  const createStage = useCreatePipelineStage();
  const renameStage = useUpdatePipelineStage();
  const deleteStage = useDeletePipelineStage();
  const reorderStages = useReorderPipelineStages();
  const [newStageName, setNewStageName] = useState("");

  const orderedStages = useMemo(
    () => [...(stages ?? [])].sort((left, right) => left.order_index - right.order_index),
    [stages]
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const applicationId = String(active.id);
    const targetStageId = String(over.id);
    const currentStageId = active.data.current?.stageId ? String(active.data.current.stageId) : null;

    if (!targetStageId || currentStageId === targetStageId) return;

    try {
      await updateStage.mutateAsync({ id: applicationId, stage_id: targetStageId });
      toast.success(t("stageUpdated"));
    } catch {
      toast.error(t("stageUpdateFailed"));
    }
  };

  const getAppsForStage = (stageId: string) => appsData?.items.filter((app) => app.stage?.id === stageId) ?? [];

  const handleCreateStage = async () => {
    const name = newStageName.trim();
    if (!name) return;
    try {
      await createStage.mutateAsync(name);
      setNewStageName("");
      toast.success(t("stageCreated"));
    } catch {
      toast.error(t("stageCreateFailed"));
    }
  };

  const handleRenameStage = async (id: string, currentName: string) => {
    const nextName = window.prompt(t("renamePrompt"), currentName)?.trim();
    if (!nextName || nextName === currentName) return;
    try {
      await renameStage.mutateAsync({ id, name: nextName });
      toast.success(t("stageRenamed"));
    } catch {
      toast.error(t("stageUpdateFailed"));
    }
  };

  const handleDeleteStage = async (id: string) => {
    if (!window.confirm(t("delete"))) return;
    try {
      await deleteStage.mutateAsync(id);
      toast.success(t("stageDeleted"));
    } catch (error: unknown) {
      const detail = typeof error === "object" && error && "response" in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : undefined;
      toast.error(detail?.includes("cannot be deleted") ? t("stageDeleteBlocked") : t("stageDeleteFailed"));
    }
  };

  const handleMoveStage = async (stageId: string, direction: -1 | 1) => {
    const index = orderedStages.findIndex((stage) => stage.id === stageId);
    const swapIndex = index + direction;
    if (index < 0 || swapIndex < 0 || swapIndex >= orderedStages.length) return;

    const nextStages = [...orderedStages];
    [nextStages[index], nextStages[swapIndex]] = [nextStages[swapIndex], nextStages[index]];

    try {
      await reorderStages.mutateAsync(nextStages);
      toast.success(t("stageReordered"));
    } catch {
      toast.error(t("stageUpdateFailed"));
    }
  };

  return (
    <div>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-6 overflow-x-auto">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{t("manageStages")}</p>
            <p className="text-xs text-muted-foreground">{t("dragToMove")}</p>
          </div>
          <div className="flex gap-2">
            <input
              value={newStageName}
              onChange={(event) => setNewStageName(event.target.value)}
              placeholder={t("newStagePlaceholder")}
              className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-52"
            />
            <button
              onClick={handleCreateStage}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("addStage")}
            </button>
          </div>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 min-w-max">
            {orderedStages.map((stage, index) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                applications={getAppsForStage(stage.id)}
                index={index}
                totalStages={orderedStages.length}
                onMoveStage={handleMoveStage}
                onRenameStage={handleRenameStage}
                onDeleteStage={handleDeleteStage}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
