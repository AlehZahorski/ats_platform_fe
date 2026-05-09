"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { formatRelative } from "@/shared/utils/format";
import type { ApplicationListItem } from "@/entities/application";

interface CandidateCardProps {
  application: ApplicationListItem;
}

export function CandidateCard({ application }: CandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
    data: {
      type: "application",
      applicationId: application.id,
      stageId: application.stage?.id ?? null,
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.6 : 1 }}
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
