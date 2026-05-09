import {
  Type, AlignLeft, Hash, Mail, Phone, List,
  CheckSquare, Calendar, Paperclip,
} from "lucide-react";
import type { FieldType } from "@/entities/forms";

export const FIELD_TYPES: { type: FieldType; label: string; icon: React.ElementType }[] = [
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

export const FIELD_TYPE_COLORS: Record<string, string> = {
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
