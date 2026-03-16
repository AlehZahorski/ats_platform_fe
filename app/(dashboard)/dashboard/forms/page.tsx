"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
  useFormTemplates,
  useCreateTemplate,
  useFormTemplate,
  useUpdateTemplate,
  useAddField,
  useDeleteField,
} from "@/services/queries";
import type { FieldType, FormField } from "@/types";
import {
  Plus, Trash2, GripVertical, FileText, ChevronRight,
  Type, AlignLeft, Hash, Mail, Phone, List,
  CheckSquare, Calendar, Paperclip, ToggleLeft, X,
} from "lucide-react";
import { toast } from "sonner";

// ─── Field type config ────────────────────────────────────────────────────
const FIELD_TYPES: { type: FieldType; label: string; icon: React.ElementType }[] = [
  { type: "text",        label: "Short text",   icon: Type },
  { type: "textarea",    label: "Long text",    icon: AlignLeft },
  { type: "number",      label: "Number",       icon: Hash },
  { type: "email",       label: "Email",        icon: Mail },
  { type: "phone",       label: "Phone",        icon: Phone },
  { type: "select",      label: "Dropdown",     icon: List },
  { type: "multiselect", label: "Multi-select", icon: List },
  { type: "checkbox",    label: "Checkbox",     icon: CheckSquare },
  { type: "date",        label: "Date",         icon: Calendar },
  { type: "file",        label: "File upload",  icon: Paperclip },
];

const FIELD_TYPE_COLORS: Record<string, string> = {
  text:        "bg-blue-500/10 text-blue-500",
  textarea:    "bg-purple-500/10 text-purple-500",
  number:      "bg-orange-500/10 text-orange-500",
  email:       "bg-green-500/10 text-green-500",
  phone:       "bg-teal-500/10 text-teal-500",
  select:      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  multiselect: "bg-amber-500/10 text-amber-500",
  checkbox:    "bg-pink-500/10 text-pink-500",
  date:        "bg-red-500/10 text-red-500",
  file:        "bg-indigo-500/10 text-indigo-500",
};

// ─── Add Field Modal ──────────────────────────────────────────────────────
function AddFieldModal({
  templateId,
  onClose,
  nextOrder,
}: {
  templateId: string;
  onClose: () => void;
  nextOrder: number;
}) {
  const addField = useAddField(templateId);
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [required, setRequired] = useState(false);
  const [optionsText, setOptionsText] = useState("");

  const needsOptions = fieldType === "select" || fieldType === "multiselect";

  const handleAdd = async () => {
    if (!label.trim()) { toast.error("Field label is required"); return; }
    const options = needsOptions
      ? optionsText.split("\n").map((o) => o.trim()).filter(Boolean)
      : undefined;

    try {
      await addField.mutateAsync({
        label: label.trim(),
        field_type: fieldType,
        required,
        options: options?.length ? options : null,
        order_index: nextOrder,
      });
      toast.success("Field added");
      onClose();
    } catch {
      toast.error("Failed to add field");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">Add Field</h3>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Field Label *</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Years of experience"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Field type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Field Type</label>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map(({ type, label: typeLabel, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setFieldType(type)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    fieldType === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {typeLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Options for select/multiselect */}
          {needsOptions && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Options <span className="text-muted-foreground font-normal">(one per line)</span>
              </label>
              <textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder={"Option 1\nOption 2\nOption 3"}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          )}

          {/* Required toggle */}
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/40">
            <div>
              <p className="text-sm font-medium text-foreground">Required field</p>
              <p className="text-xs text-muted-foreground">Candidates must fill this in</p>
            </div>
            <button
              onClick={() => setRequired(!required)}
              className={`w-10 h-6 rounded-full transition-all relative ${required ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${required ? "left-4" : "left-0.5"}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={handleAdd}
            disabled={!label.trim() || addField.isPending}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            {addField.isPending ? "Adding..." : "Add Field"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Field Card ────────────────────────────────────────────────────────────
function FieldCard({
  field,
  templateId,
  index,
}: {
  field: FormField;
  templateId: string;
  index: number;
}) {
  const deleteField = useDeleteField(templateId);
  const typeConfig = FIELD_TYPES.find((t) => t.type === field.field_type);
  const Icon = typeConfig?.icon ?? Type;
  const colorClass = FIELD_TYPE_COLORS[field.field_type] ?? "bg-muted text-muted-foreground";

  const handleDelete = async () => {
    try {
      await deleteField.mutateAsync(field.id);
      toast.success("Field removed");
    } catch {
      toast.error("Failed to remove field");
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
          {field.required && (
            <span className="text-xs text-destructive font-bold shrink-0">*</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground capitalize">
            {typeConfig?.label ?? field.field_type}
          </span>
          {field.options && field.options.length > 0 && (
            <span className="text-xs text-muted-foreground">
              · {field.options.length} options
            </span>
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

// ─── Template Editor ───────────────────────────────────────────────────────
function TemplateEditor({ templateId, onBack }: { templateId: string; onBack: () => void }) {
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
      {/* Header */}
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
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setEditingName(false); }}
                autoFocus
                className="font-display text-xl font-bold bg-transparent border-b-2 border-primary text-foreground focus:outline-none"
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
        <button
          onClick={() => setShowAddField(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Field
        </button>
      </div>

      {/* Fields list */}
      {fields.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No fields yet</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">Add your first field to build the form</p>
          <button
            onClick={() => setShowAddField(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            Add first field
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, i) => (
            <FieldCard key={field.id} field={field} templateId={templateId} index={i} />
          ))}
        </div>
      )}

      {/* Field type legend */}
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

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function FormsPage() {
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{templates?.length ?? 0} templates</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> New Template
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-3">New Form Template</h3>
            <div className="flex gap-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. Engineering Application Form"
                autoFocus
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || createTemplate.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {createTemplate.isPending ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Templates list */}
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
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              Create first template
            </button>
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
                <p className="text-xs text-muted-foreground">
                  {template.fields?.length ?? 0} fields
                </p>

                {/* Field type pills */}
                {template.fields && template.fields.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {[...new Set(template.fields.slice(0, 4).map((f) => f.field_type))].map((type) => {
                      const colorClass = FIELD_TYPE_COLORS[type] ?? "bg-muted text-muted-foreground";
                      return (
                        <span key={type} className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                          {type}
                        </span>
                      );
                    })}
                    {(template.fields.length > 4) && (
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