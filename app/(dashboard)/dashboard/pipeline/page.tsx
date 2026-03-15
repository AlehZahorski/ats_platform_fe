"use client";
import { Topbar } from "@/components/layout/Topbar";
import { usePipelineStages, useApplications, useUpdateStage } from "@/services/queries";
import { toast } from "sonner";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { formatRelative } from "@/lib/utils";

export default function PipelinePage() {
  const { data: stages } = usePipelineStages();
  const { data: appsData } = useApplications();
  const updateStage = useUpdateStage();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    try {
      await updateStage.mutateAsync({ id: String(active.id), stage_id: String(over.id) });
      toast.success("Stage updated");
    } catch { toast.error("Failed to update stage"); }
  };

  const getAppsForStage = (stageId: string) =>
    appsData?.items.filter((a) => a.stage?.id === stageId) ?? [];

  return (
    <div>
      <Topbar title="Pipeline" />
      <div className="p-6 overflow-x-auto">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 min-w-max">
            {stages?.map((stage) => {
              const apps = getAppsForStage(stage.id);
              return (
                <div key={stage.id} className="w-72 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-foreground">{stage.name}</h3>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{apps.length}</span>
                  </div>
                  <div className="space-y-2 min-h-24 bg-muted/30 rounded-xl p-2">
                    {apps.map((app) => (
                      <div key={app.id} className="bg-card border border-border rounded-lg p-3 shadow-sm cursor-grab hover:border-primary/30 transition-all">
                        <p className="font-medium text-sm text-foreground">{app.first_name} {app.last_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{app.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatRelative(app.created_at)}</p>
                      </div>
                    ))}
                    {apps.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No candidates</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
