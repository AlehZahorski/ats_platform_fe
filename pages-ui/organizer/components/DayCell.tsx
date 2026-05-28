"use client";
import { cn } from "@/lib/utils";
import { Clock, StickyNote, Users } from "lucide-react";
import type { DayAggregate } from "@/services/api/organizer";
import { STATUS_CONFIG } from "../lib/statusConfig";
import { shortTime } from "../lib/week";

interface Props {
  day: DayAggregate;
  isToday: boolean;
  isWeekend: boolean;
  onClick: () => void;
}

export function DayCell({ day, isToday, isWeekend, onClick }: Props) {
  const status = day.status ? STATUS_CONFIG[day.status] : null;
  const hasAnyData = !!status || day.tasks_total > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-1 text-left p-2 min-h-[68px] w-full border-l border-border/40",
        "hover:bg-accent/40 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary/40",
        isToday && "bg-amber-500/[0.04]",
        isWeekend && "bg-muted/30 opacity-80"
      )}
    >
      {status && (
        <div className={cn("absolute left-0 top-0 bottom-0 w-1", status.bar)} />
      )}

      {!hasAnyData && (
        <div className="flex flex-col items-start justify-center h-full pl-2 text-xs text-muted-foreground/60">
          <span className="text-base leading-none">—</span>
          <span className="mt-1">Brak wpisu</span>
        </div>
      )}

      {status && (
        <div className="pl-2 flex flex-col gap-1.5">
          {/* Hours line — only when status shows times */}
          {!status.hidesHours ? (
            <div className="flex items-center gap-1 text-sm font-medium">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span>
                {shortTime(day.start_time) || "—"}{day.end_time ? `–${shortTime(day.end_time)}` : ""}
              </span>
            </div>
          ) : (
            <div className={cn("flex items-center gap-1.5 text-sm font-medium", status.text)}>
              <status.icon className="w-3.5 h-3.5" />
              <span>{status.labelPl}</span>
            </div>
          )}

          {/* Task badge */}
          <TaskBadge total={day.tasks_total} done={day.tasks_done} overdue={day.tasks_overdue} />

          {/* Note icons */}
          {(day.has_note || day.has_manager_note) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              {day.has_note && <StickyNote className="w-3 h-3" />}
              {day.has_manager_note && <Users className="w-3 h-3" />}
            </div>
          )}
        </div>
      )}
    </button>
  );
}

function TaskBadge({ total, done, overdue }: { total: number; done: number; overdue: number }) {
  if (total === 0) {
    return <span className="inline-flex w-fit px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">0 zadań</span>;
  }
  if (overdue > 0) {
    return (
      <span className="inline-flex w-fit px-1.5 py-0.5 rounded text-xs bg-rose-500/15 text-rose-500 font-medium">
        {overdue} {overdue === 1 ? "zaległe" : "zaległych"}
      </span>
    );
  }
  if (done === total) {
    return <span className="inline-flex w-fit px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">{total} {labelTasks(total)}</span>;
  }
  return (
    <span className="inline-flex w-fit px-1.5 py-0.5 rounded text-xs bg-sky-500/15 text-sky-500 font-medium">
      {total} {labelTasks(total)}
    </span>
  );
}

function labelTasks(n: number) {
  if (n === 1) return "zadanie";
  if (n >= 2 && n <= 4) return "zadania";
  return "zadań";
}
