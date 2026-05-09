export type FieldType =
  | "text" | "textarea" | "number" | "email" | "phone"
  | "select" | "multiselect" | "checkbox" | "file" | "date";

export interface FormField {
  id: string;
  template_id: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  options: string[] | null;
  validation: Record<string, unknown> | null;
  order_index: number;
}

export interface FormTemplate {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
  fields: FormField[];
}
