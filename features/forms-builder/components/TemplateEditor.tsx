"use client";

import { useState } from "react";
import { Plus, ChevronRight, FileText, Type } from "lucide-react";
import { toast } from "sonner";
import { useFormTemplate, useUpdateTemplate } from "@/services/queries";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FIELD_TYPES, FIELD_TYPE_COLORS } from "../config/field-types";
import { FieldCard } from "./FieldCard";
import { AddFieldModal } from "./AddFieldModal";

interface TemplateEditorProps {
  templateId: string;
  onBack: () => void;
}

export function TemplateEditor({ templateId, onBack }: TemplateEditorProps) {
  const { data: template, isLoading } = useFormTemplate(templateId);
  const updateTemplate = useUpdateTemplate(templateId);
  const [showAddField, setShowAddField] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const handleRename = async () => {
    if (!nameInput.trim()) return;
    try {
      await updateTemplate.mutateAsync({ name: nameInput.trim() });
      toast.success("Template renamed");
      setEditingName(false);
    } catch {
      toast.error("Failed to rename");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!template) return null;

  const fields = [...(template.fields ?? [])].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <div className="flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") setEditingName(false);
                }}
                autoFocus
                className="font-display text-xl font-bold bg-transparent border-b-2 border-primary rounded-none px-0"
              />
              <button onClick={handleRename} className="text-xs text-primary font-medium">Save</button>
              <button onClick={() => setEditingName(false)} className="text-xs text-muted-foreground">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => { setNameInput(template.name); setEditingName(true); }}
              className="font-display text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              {template.name}
            </button>
          )}
          <p className="text-sm text-muted-foreground mt-0.5">{fields.length} fields</p>
        </div>
        <Button onClick={() => setShowAddField(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No fields yet</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">Add your first field to build the form</p>
          <Button onClick={() => setShowAddField(true)}>Add first field</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, i) => (
            <FieldCard key={field.id} field={field} templateId={templateId} index={i} />
          ))}
        </div>
      )}

      {fields.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Field Types Used</p>
          <div className="flex flex-wrap gap-2">
            {[...new Set(fields.map((f) => f.field_type))].map((type) => {
              const config = FIELD_TYPES.find((t) => t.type === type);
              const Icon = config?.icon ?? Type;
              const colorClass = FIELD_TYPE_COLORS[type] ?? "bg-muted text-muted-foreground";
              return (
                <span key={type} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${colorClass}`}>
                  <Icon className="w-3 h-3" />
                  {config?.label ?? type}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {showAddField && (
        <AddFieldModal
          templateId={templateId}
          onClose={() => setShowAddField(false)}
          nextOrder={fields.length}
        />
      )}
    </div>
  );
}
