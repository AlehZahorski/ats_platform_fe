import { Clock, Home, Plane, Stethoscope, MoonStar } from "lucide-react";
import type { ScheduleStatus } from "@/services/api/organizer";

type StatusDef = {
  key: ScheduleStatus;
  labelPl: string;
  labelEn: string;
  bar: string;       // bg color for the left vertical bar (Tailwind class)
  bg: string;        // soft background for badges (Tailwind class)
  text: string;      // text color for label (Tailwind class)
  dot: string;       // dot color for the footer legend
  icon: typeof Clock;
  hidesHours: boolean;
};

export const STATUS_CONFIG: Record<ScheduleStatus, StatusDef> = {
  work:     { key: "work",     labelPl: "Praca",        labelEn: "Working",   bar: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-500", dot: "bg-emerald-500", icon: Clock,       hidesHours: false },
  remote:   { key: "remote",   labelPl: "Praca zdalna", labelEn: "Remote",    bar: "bg-sky-500",     bg: "bg-sky-500/10",     text: "text-sky-500",     dot: "bg-sky-500",     icon: Home,        hidesHours: false },
  vacation: { key: "vacation", labelPl: "Urlop",        labelEn: "Vacation",  bar: "bg-amber-500",   bg: "bg-amber-500/10",   text: "text-amber-500",   dot: "bg-amber-500",   icon: Plane,       hidesHours: true  },
  sick:     { key: "sick",     labelPl: "Chorobowe",    labelEn: "Sick leave",bar: "bg-rose-500",    bg: "bg-rose-500/10",    text: "text-rose-500",    dot: "bg-rose-500",    icon: Stethoscope, hidesHours: true  },
  off:      { key: "off",      labelPl: "Wolne",        labelEn: "Off",       bar: "bg-zinc-500",    bg: "bg-zinc-500/10",    text: "text-zinc-400",    dot: "bg-zinc-500",    icon: MoonStar,    hidesHours: true  },
};

export const STATUS_ORDER: ScheduleStatus[] = ["work", "remote", "vacation", "sick", "off"];
