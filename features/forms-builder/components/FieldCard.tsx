"use client";

import { useTranslations } from "next-intl";
import { GripVertical, Trash2, Type } from "lucide-react";
import { toast } from "sonner";
import { useDeleteField } from "@/services/queries";
import type { FormField } from "@/entities/forms";
import { FIELD_TYPES, FIELD_TYPE_COLORS } from "../config/field-types";

interface FieldCardProps {
  field: FormField;
  templateId: string;
  index: number;
}

export function FieldCard({ field, templateId, index }: FieldCardProps) {
  const t = useTranslations("forms");
  const deleteField = useDeleteField(templateId);
  const typeConfig = FIELD_TYPES.find((t) => t.type === field.field_type);
  const Icon = typeConfig?.icon ?? Type;
  const colorClass = FIELD_TYPE_COLORS[field.field_type] ?? "bg-muted text-muted-foreground";

  const handleDelete = async () => {
    try {
      await deleteField.mutateAsync(field.id);
      toast.success(t("fieldRemoved"));
    } catch {
      toast.error(t("failedRemove"));
    }
  };

  return (
    <div
      className="group flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all animate-fade-in"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="text-muted-foreground/40 cursor-grab">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{field.label}</p>
          {field.required && <span className="text-xs text-destructive font-bold shrink-0">*</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground capitalize">
            {typeConfig?.label ?? field.field_type}
          </span>
          {field.options && field.options.length > 0 && (
            <span className="text-xs text-muted-foreground">· {field.options.length} {t("options").toLowerCase()}</span>
          )}
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={deleteField.isPending}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
