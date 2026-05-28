"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { Lock, Plus, Save, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  organizerKeys,
  useOrganizerDay,
  useUpsertSchedule,
} from "@/services/queries/organizer.queries";
import type { ScheduleStatus } from "@/services/api/organizer";
import { STATUS_CONFIG, STATUS_ORDER } from "../lib/statusConfig";
import { formatLongDatePl, shortTime } from "../lib/week";
import { tasksApi } from "@/services/api/tasks";
import { useMe } from "@/services/queries";
import { useQueryClient } from "@tanstack/react-query";

const TASK_TYPE_COLORS: Record<string, string> = {
  follow_up:    "border-l-sky-500",
  reminder:     "border-l-violet-500",
  review:       "border-l-emerald-500",
  call:         "border-l-orange-500",
};

const TASK_TYPE_LABELS_PL: Record<string, string> = {
  follow_up: "Follow-up",
  reminder:  "Przypomnienie",
  review:    "Review",
  call:      "Telefon",
};

interface Props {
  open: boolean;
  userId: string | null;
  date: string | null;
  onClose: () => void;
}

export function DayModal({ open, userId, date, onClose }: Props) {
  const enabled = !!(open && userId && date);
  const { data, isLoading } = useOrganizerDay({
    user_id: userId ?? "",
    date: date ?? "",
    enabled,
  });
  const { data: me } = useMe();
  const upsert = useUpsertSchedule();
  const qc = useQueryClient();

  const isManager = me?.role === "owner" || me?.role === "manager";
  const isSelfTarget = me?.id === userId;
  const canEditSchedule = isManager || isSelfTarget;

  // Form state — controlled, mirrors backend response
  const [status, setStatus] = useState<ScheduleStatus>("work");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [managerNote, setManagerNote] = useState<string>("");
  const [dirty, setDirty] = useState(false);

  // Reset form whenever backend data lands
  useEffect(() => {
    if (!data) return;
    setStatus(data.schedule.status);
    setStart(shortTime(data.schedule.start_time));
    setEnd(shortTime(data.schedule.end_time));
    setNote(data.schedule.note ?? "");
    setManagerNote(data.schedule.manager_note ?? "");
    setDirty(false);
  }, [data]);

  const statusDef = STATUS_CONFIG[status];
  const hidesHours = statusDef.hidesHours;

  const handleSave = async () => {
    if (!userId || !date) return;
    await upsert.mutateAsync({
      user_id: userId,
      date,
      status,
      start_time: hidesHours ? null : start ? `${start}:00` : null,
      end_time: hidesHours ? null : end ? `${end}:00` : null,
      note: note.trim() ? note.trim() : null,
      manager_note: isManager ? (managerNote.trim() ? managerNote.trim() : null) : undefined,
    });
    setDirty(false);
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await tasksApi.update(taskId, { completed });
    if (userId && date) {
      qc.invalidateQueries({ queryKey: organizerKeys.day(userId, date) });
      qc.invalidateQueries({ queryKey: ["organizer", "board"] });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-5xl p-0 gap-0">
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex items-center gap-4">
            <UserAvatar user={data?.user} size={56} />
            <div>
              <div className="text-2xl font-semibold">{data ? nameFromEmail(data.user.email) : "—"}</div>
              {date && <div className="text-sm text-muted-foreground mt-0.5">{formatLongDatePl(new Date(date))}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2 pr-8">
            <StatusPill status={status} />
          </div>
        </div>

        {/* Section tab indicators (purely visual on desktop) */}
        <div className="grid grid-cols-3 mt-6 border-b border-border">
          <SectionTitle active>Harmonogram</SectionTitle>
          <SectionTitle>Zadania ({data?.tasks.length ?? 0})</SectionTitle>
          <SectionTitle>Notatki</SectionTitle>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 py-6 max-h-[60vh] overflow-y-auto">
          {/* Harmonogram */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Od</label>
                <Input
                  type="time"
                  value={start}
                  disabled={!canEditSchedule || hidesHours}
                  onChange={(e) => {
                    setStart(e.target.value);
                    setDirty(true);
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Do</label>
                <Input
                  type="time"
                  value={end}
                  disabled={!canEditSchedule || hidesHours}
                  onChange={(e) => {
                    setEnd(e.target.value);
                    setDirty(true);
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status dnia</label>
              <Select
                disabled={!canEditSchedule}
                value={status}
                onValueChange={(v) => {
                  setStatus(v as ScheduleStatus);
                  setDirty(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((k) => {
                    const s = STATUS_CONFIG[k];
                    const Icon = s.icon;
                    return (
                      <SelectItem key={k} value={k}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn("w-3.5 h-3.5", s.text)} />
                          <span>{s.labelPl}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {hidesHours && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Dla statusów innych niż „Praca" pola godzin są wyłączone.
                </p>
              )}
            </div>

            {data?.schedule.updated_by && data.schedule.updated_at && (
              <div className="text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
                Edytowano przez {nameFromEmail(data.schedule.updated_by.email)},{" "}
                {new Date(data.schedule.updated_at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
              </div>
            )}
          </div>

          {/* Zadania */}
          <div className="space-y-3">
            {isLoading && <div className="text-sm text-muted-foreground">Ładowanie…</div>}
            {!isLoading && (data?.tasks.length ?? 0) === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <CheckCircle2 className="w-10 h-10 opacity-50" />
                <span className="text-sm">Brak zadań na ten dzień</span>
              </div>
            )}
            {data?.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={(c) => handleToggleTask(task.id, c)}
              />
            ))}
            <button
              type="button"
              className="w-full py-3 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:bg-accent/40 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Dodaj zadanie
            </button>
          </div>

          {/* Notatki */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Notatka pracownika
              </label>
              <Textarea
                value={note}
                disabled={!canEditSchedule}
                onChange={(e) => {
                  setNote(e.target.value.slice(0, 1000));
                  setDirty(true);
                }}
                rows={5}
                placeholder="Brak notatki. Dodaj…"
              />
              <div className="text-right text-xs text-muted-foreground mt-1">{note.length}/1000</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Notatka kierownika
              </label>
              <div className={cn("rounded-md", !isManager && "ring-1 ring-amber-300/40")}>
                <Textarea
                  value={managerNote}
                  readOnly={!isManager}
                  disabled={!isManager && !managerNote}
                  onChange={(e) => {
                    setManagerNote(e.target.value.slice(0, 1000));
                    setDirty(true);
                  }}
                  rows={5}
                  placeholder={isManager ? "Dodaj notatkę kierownika…" : "Brak notatki kierownika"}
                />
              </div>
              {!isManager && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                  <Lock className="w-3 h-3" />
                  Tylko do odczytu
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <div className="flex-1 text-sm text-muted-foreground">
            {dirty ? "Nie zapisano zmian" : ""}
          </div>
          <Button variant="ghost" onClick={onClose}>Anuluj</Button>
          <Button onClick={handleSave} disabled={!dirty || !canEditSchedule || upsert.isPending}>
            <Save className="w-4 h-4 mr-1.5" />
            Zapisz
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusPill({ status }: { status: ScheduleStatus }) {
  const def = STATUS_CONFIG[status];
  const Icon = def.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium", def.bg, def.text)}>
      <Icon className="w-3.5 h-3.5" />
      {def.labelPl}
    </span>
  );
}

function SectionTitle({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <div
      className={cn(
        "text-center py-3 text-sm font-medium",
        active ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground"
      )}
    >
      {children}
    </div>
  );
}

function TaskCard({
  task,
  onToggle,
}: {
  task: { id: string; title: string; description: string | null; type: string | null; completed: boolean; due_date: string | null; created_by: { email: string; avatar_key: string | null } | null };
  onToggle: (completed: boolean) => void;
}) {
  const typeColor = task.type ? TASK_TYPE_COLORS[task.type] ?? "border-l-muted-foreground" : "border-l-muted-foreground";
  const typeLabel = task.type ? TASK_TYPE_LABELS_PL[task.type] ?? task.type : "—";
  const dueTime = task.due_date ? new Date(task.due_date) : null;

  return (
    <div className={cn("border-l-4 border border-border rounded-md p-3 bg-card", typeColor, task.completed && "opacity-60")}>
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => onToggle(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-border"
        />
        <div className="flex-1 min-w-0">
          <div className={cn("text-sm font-medium", task.completed && "line-through")}>{task.title}</div>
          {task.description && (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</div>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="px-1.5 py-0.5 rounded bg-muted">{typeLabel}</span>
            {dueTime && <span>{dueTime.toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}</span>}
            {task.created_by && (
              <span className="flex items-center gap-1">
                <UserAvatar user={task.created_by as never} size={16} />
                od: {nameFromEmail(task.created_by.email)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.split(/[._-]/).filter(Boolean).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}
