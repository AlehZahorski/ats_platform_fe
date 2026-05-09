"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { Topbar } from "@/shared/layout/Topbar";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { StageColumn } from "@/features/pipeline/components/StageColumn";
import { usePipelineBoard } from "@/features/pipeline/hooks/usePipelineBoard";

export function PipelinePage() {
  const {
    t, orderedStages, newStageName, setNewStageName, getAppsForStage,
    handleDragEnd, handleCreateStage, handleRenameStage, handleDeleteStage, handleMoveStage,
    isCreating,
  } = usePipelineBoard();

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
            <Input
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder={t("newStagePlaceholder")}
              className="min-w-52"
            />
            <Button onClick={handleCreateStage} disabled={isCreating} className="gap-2">
              <Plus className="w-4 h-4" />
              {t("addStage")}
            </Button>
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
