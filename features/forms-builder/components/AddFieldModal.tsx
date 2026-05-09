"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useAddField } from "@/services/queries";
import type { FieldType } from "@/entities/forms";
import { FIELD_TYPES } from "../config/field-types";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";

interface AddFieldModalProps {
  templateId: string;
  onClose: () => void;
  nextOrder: number;
}

export function AddFieldModal({ templateId, onClose, nextOrder }: AddFieldModalProps) {
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
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="field-label">Field Label *</Label>
            <Input
              id="field-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Years of experience"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Field Type</Label>
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

          {needsOptions && (
            <div className="space-y-1.5">
              <Label>
                Options <span className="text-muted-foreground font-normal">(one per line)</span>
              </Label>
              <Textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder={"Option 1\nOption 2\nOption 3"}
                rows={4}
              />
            </div>
          )}

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
          <Button
            onClick={handleAdd}
            disabled={!label.trim() || addField.isPending}
            className="flex-1"
          >
            {addField.isPending ? "Adding..." : "Add Field"}
          </Button>
          <Button variant="outline" onClick={onClose} className="px-4">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
