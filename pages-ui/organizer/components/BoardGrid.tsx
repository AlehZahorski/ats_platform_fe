"use client";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { BoardResponse, EmployeeRow } from "@/services/api/organizer";
import { DayCell } from "./DayCell";
import { addDays, isSameDay, isWeekend as dateIsWeekend, shortDate, toISODate, weekdayShortMonFirst } from "../lib/week";

interface Props {
  board: BoardResponse;
  weekStart: Date;
  onSelectDay: (userId: string, date: string) => void;
  searchQuery: string;
}

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  owner:     { label: "Owner",     cls: "bg-amber-500/15 text-amber-500" },
  manager:   { label: "Manager",   cls: "bg-violet-500/15 text-violet-500" },
  recruiter: { label: "Recruiter", cls: "bg-sky-500/15 text-sky-500" },
};

export function BoardGrid({ board, weekStart, onSelectDay, searchQuery }: Props) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const query = searchQuery.trim().toLowerCase();
  const rows = query
    ? board.employees.filter((r) => r.user.email.toLowerCase().includes(query))
    : board.employees;

  return (
    <div className="border border-border rounded-lg overflow-auto bg-card">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="sticky left-0 z-10 bg-muted/30 text-left px-4 py-3 min-w-[220px] text-sm font-medium text-muted-foreground">
              Pracownik
            </th>
            {days.map((d) => {
              const todayCol = isSameDay(d, today);
              const weekend = dateIsWeekend(d);
              return (
                <th
                  key={toISODate(d)}
                  className={cn(
                    "px-2 py-3 text-center text-xs font-medium uppercase tracking-wide border-l border-border/40",
                    "min-w-[120px]",
                    weekend && "min-w-[90px] opacity-70",
                    todayCol && "ring-2 ring-amber-400 ring-inset relative"
                  )}
                >
                  <div className="text-foreground">{weekdayShortMonFirst(d)}</div>
                  <div className="text-muted-foreground mt-0.5 font-normal">{shortDate(d)}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="py-12 text-center text-muted-foreground text-sm">
                Brak pracowników do wyświetlenia
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <EmployeeRowView key={row.user.id} row={row} days={days} onSelectDay={onSelectDay} today={today} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmployeeRowView({
  row,
  days,
  onSelectDay,
  today,
}: {
  row: EmployeeRow;
  days: Date[];
  onSelectDay: (userId: string, date: string) => void;
  today: Date;
}) {
  const roleBadge = ROLE_BADGE[row.user.role] ?? { label: row.user.role, cls: "bg-muted text-muted-foreground" };
  const displayName = nameFromEmail(row.user.email);

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="sticky left-0 z-10 bg-card px-4 py-3 align-middle">
        <div className="flex items-center gap-3">
          <UserAvatar user={row.user} size={40} />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{displayName}</span>
            <span className={cn("inline-flex w-fit px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide", roleBadge.cls)}>
              {roleBadge.label}
            </span>
          </div>
        </div>
      </td>
      {row.days.map((day, i) => (
        <td key={day.date} className="p-0 align-stretch">
          <DayCell
            day={day}
            isToday={isSameDay(days[i], today)}
            isWeekend={dateIsWeekend(days[i])}
            onClick={() => onSelectDay(row.user.id, day.date)}
          />
        </td>
      ))}
    </tr>
  );
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
