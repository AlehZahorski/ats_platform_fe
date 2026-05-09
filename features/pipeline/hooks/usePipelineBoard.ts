import { useMemo, useState } from "react";
import { type DragEndEvent } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  useApplications,
  useCreatePipelineStage,
  useDeletePipelineStage,
  usePipelineStages,
  useReorderPipelineStages,
  useUpdateStage,
  useUpdatePipelineStage,
} from "@/services/queries";
import { getApiErrorMessage } from "@/shared/utils/api-error";

export function usePipelineBoard() {
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
    () => [...(stages ?? [])].sort((a, b) => a.order_index - b.order_index),
    [stages]
  );

  const getAppsForStage = (stageId: string) =>
    appsData?.items.filter((app) => app.stage?.id === stageId) ?? [];

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
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? t("stageUpdateFailed"));
    }
  };

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
    } catch (error) {
      const detail = getApiErrorMessage(error);
      toast.error(detail?.includes("cannot be deleted") ? t("stageDeleteBlocked") : t("stageDeleteFailed"));
    }
  };

  const handleMoveStage = async (stageId: string, direction: -1 | 1) => {
    const index = orderedStages.findIndex((s) => s.id === stageId);
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

  return {
    t,
    orderedStages,
    newStageName,
    setNewStageName,
    getAppsForStage,
    handleDragEnd,
    handleCreateStage,
    handleRenameStage,
    handleDeleteStage,
    handleMoveStage,
    isCreating: createStage.isPending,
  };
}
