// Normalize a date to its Monday (ISO week start).
export function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const PL_MONTHS_SHORT = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
const PL_MONTHS_LONG = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
const PL_WEEKDAYS_SHORT = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
const PL_WEEKDAYS_LONG = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];

// Render "Pon" / "Wt" / ... — we always show Monday-first in UI, but JS Date.getDay() is Sunday-first
const WEEKDAY_LABELS_MON_FIRST = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];

export function weekdayShortMonFirst(date: Date): string {
  const day = date.getDay(); // 0 Sun .. 6 Sat
  const idx = day === 0 ? 6 : day - 1;
  return WEEKDAY_LABELS_MON_FIRST[idx];
}

export function weekdayLongPl(date: Date): string {
  return PL_WEEKDAYS_LONG[date.getDay()];
}

export function shortDate(date: Date): string {
  // "18.05"
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}.${m}`;
}

export function formatWeekRange(start: Date, end: Date): string {
  // "18 maj – 24 maj 2026"
  const sm = PL_MONTHS_SHORT[start.getMonth()];
  const em = PL_MONTHS_SHORT[end.getMonth()];
  return `${start.getDate()} ${sm} – ${end.getDate()} ${em} ${end.getFullYear()}`;
}

export function formatLongDatePl(date: Date): string {
  // "środa, 21 maja 2026"
  return `${weekdayLongPl(date)}, ${date.getDate()} ${PL_MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

export function isWeekend(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}

// "HH:MM" from backend "HH:MM:SS"
export function shortTime(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 5);
}
