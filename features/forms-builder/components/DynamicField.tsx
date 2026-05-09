"use client";

import { useTranslations } from "next-intl";
import type { FormField } from "@/entities/forms";

interface DynamicFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}

export function DynamicField({ field, value, onChange }: DynamicFieldProps) {
  const t = useTranslations("apply");
  const baseClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  switch (field.field_type) {
    case "textarea":
      return (
        <textarea
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={`${baseClass} resize-none`}
        />
      );

    case "select":
      return (
        <select
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        >
          <option value="">{t("selectOption")}</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case "multiselect":
      return (
        <div className="space-y-2">
          {(field.options ?? []).map((option) => {
            const selected = value.split(",").filter(Boolean);
            const checked = selected.includes(option);
            return (
              <label key={option} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? selected.filter((i) => i !== option) : [...selected, option];
                    onChange(next.join(","));
                  }}
                  className="w-4 h-4 rounded border-input accent-primary"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">{option}</span>
              </label>
            );
          })}
        </div>
      );

    case "checkbox":
      return (
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => onChange(e.target.checked ? "true" : "false")}
            className="w-4 h-4 rounded border-input accent-primary"
          />
          <span className="text-sm text-foreground">{field.label}</span>
        </label>
      );

    case "number":
      return (
        <input
          type="number"
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );

    case "email":
      return (
        <input
          type="email"
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );

    case "phone":
      return (
        <input
          type="tel"
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );

    case "date":
      return (
        <input
          type="date"
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );

    default:
      return (
        <input
          type="text"
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );
  }
}
