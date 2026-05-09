"use client";

import { useState } from "react";
import { FileText, Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useFormTemplates, useCreateTemplate } from "@/services/queries";
import { Topbar } from "@/shared/layout/Topbar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FIELD_TYPE_COLORS } from "@/features/forms-builder/config/field-types";
import { TemplateEditor } from "@/features/forms-builder/components/TemplateEditor";

export function FormsPage() {
  const { data: templates, isLoading } = useFormTemplates();
  const createTemplate = useCreateTemplate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const template = await createTemplate.mutateAsync({ name: newName.trim() });
      toast.success("Template created");
      setNewName("");
      setShowCreate(false);
      setSelectedId(template.id);
    } catch {
      toast.error("Failed to create template");
    }
  };

  if (selectedId) {
    return (
      <div>
        <Topbar title="Form Builder" />
        <div className="p-6">
          <TemplateEditor templateId={selectedId} onBack={() => setSelectedId(null)} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Form Templates" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{templates?.length ?? 0} templates</p>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Template
          </Button>
        </div>

        {showCreate && (
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-3">New Form Template</h3>
            <div className="flex gap-3">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. Engineering Application Form"
                autoFocus
                className="flex-1"
              />
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || createTemplate.isPending}
              >
                {createTemplate.isPending ? "Creating..." : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : templates?.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No form templates yet</p>
            <p className="text-muted-foreground text-sm mt-1 mb-4">
              Create a template to start collecting structured candidate data
            </p>
            <Button onClick={() => setShowCreate(true)}>Create first template</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map((template, i) => (
              <button
                key={template.id}
                onClick={() => setSelectedId(template.id)}
                className="text-left bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all animate-fade-in group"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1 truncate">{template.name}</h3>
                <p className="text-xs text-muted-foreground">{template.fields?.length ?? 0} fields</p>

                {template.fields && template.fields.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {[...new Set(template.fields.slice(0, 4).map((f) => f.field_type))].map((type) => (
                      <span
                        key={type}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${FIELD_TYPE_COLORS[type] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {type}
                      </span>
                    ))}
                    {template.fields.length > 4 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        +{template.fields.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
