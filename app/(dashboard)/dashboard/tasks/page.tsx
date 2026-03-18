"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Topbar } from "@/components/layout/Topbar";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/services/queries/tasks-reports.queries";
import type { Task } from "@/services/api/tasks";
import { Plus, CheckSquare, Square, Trash2, Clock, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const TASK_TYPES = ["follow_up", "reminder", "review", "call"];
const FILTERS = ["all", "pending", "completed"] as const;

// ─── Create Task Form ─────────────────────────────────────────────────────────
function CreateTaskForm({ onClose }: { onClose: () => void }) {
  const t = useTranslations("tasks");
  const tc = useTranslations("common");
  const createMutation = useCreateTask();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    due_date: "",
  });

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error(tc("error")); return; }
    try {
      await createMutation.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        type: form.type || undefined,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined,
      });
      toast.success(t("created"));
      onClose();
    } catch { toast.error(tc("error")); }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground text-sm">{t("new")}</h3>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">{t("taskTitle")} *</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            autoFocus placeholder="e.g. Follow up with candidate"
            className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">{t("type")}</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">No type</option>
              {TASK_TYPES.map((type) => (
                <option key={type} value={type}>{t(`types.${type}` as any)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">{t("dueDate")}</label>
            <input type="datetime-local" value={form.due_date}
              onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">{t("description")}</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2} className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={handleSubmit} disabled={createMutation.isPending}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
            {createMutation.isPending ? tc("creating") : tc("create")}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-all">
            {tc("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task }: { task: Task }) {
  const t = useTranslations("tasks");
  const tc = useTranslations("common");
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date();

  const handleToggle = async () => {
    try {
      await updateMutation.mutateAsync({ id: task.id, data: { completed: !task.completed } });
    } catch { toast.error(tc("error")); }
  };

  const handleDelete = async () => {
    if (!confirm(tc("confirm"))) return;
    try {
      await deleteMutation.mutateAsync(task.id);
      toast.success(t("deleted"));
    } catch { toast.error(tc("error")); }
  };

  return (
    <div className={`bg-card border rounded-xl p-4 flex items-start gap-3 transition-all animate-fade-in ${
      task.completed ? "border-border/50 opacity-60" : "border-border hover:border-primary/30"
    }`}>
      <button onClick={handleToggle} className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors">
        {task.completed
          ? <CheckSquare className="w-5 h-5 text-primary" />
          : <Square className="w-5 h-5" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {task.type && (
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {t(`types.${task.type}` as any)}
            </span>
          )}
          {task.due_date && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
              <Clock className="w-3 h-3" />
              {formatDate(task.due_date)}
              {isOverdue && " — overdue"}
            </span>
          )}
          {task.assignee && (
            <span className="text-xs text-muted-foreground">👤 {task.assignee.email}</span>
          )}
        </div>
      </div>

      <button onClick={handleDelete} disabled={deleteMutation.isPending}
        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TasksPage() {
  const t = useTranslations("tasks");
  const [filter, setFilter] = useState<typeof FILTERS[number]>("all");
  const [showCreate, setShowCreate] = useState(false);

  const { data: tasks, isLoading } = useTasks(
    filter === "pending" ? { completed: false }
    : filter === "completed" ? { completed: true }
    : undefined
  );

  const pending = tasks?.filter((t) => !t.completed).length ?? 0;
  const completed = tasks?.filter((t) => t.completed).length ?? 0;

  return (
    <div>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{t("pending")}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{pending}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{t("completed")}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{completed}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground mt-1">{tasks?.length ?? 0}</p>
          </div>
        </div>

        {/* Filters + New */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-muted/40 rounded-lg p-1">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === f ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {t(`filters.${f}` as any)}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> {t("new")}
          </button>
        </div>

        {/* Create form */}
        {showCreate && <CreateTaskForm onClose={() => setShowCreate(false)} />}

        {/* Tasks list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : tasks?.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <CheckSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">{t("noTasks")}</p>
            <p className="text-muted-foreground text-sm mt-1">{t("noTasksDesc")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks?.map((task) => <TaskCard key={task.id} task={task} />)}
          </div>
        )}
      </div>
    </div>
  );
}