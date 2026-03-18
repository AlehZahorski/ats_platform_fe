"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useInterviews,
  useCreateInterview,
  useUpdateInterview,
  useDeleteInterview,
} from "@/services/queries/interviews.queries";
import { Interview } from "@/services/api/interviews";
import {
  Calendar, Clock, Link, Trash2, Plus, X, Pencil, Video,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

// ─── Schedule Form ────────────────────────────────────────────────────────────
function InterviewForm({
  applicationId,
  interview,
  onClose,
}: {
  applicationId: string;
  interview?: Interview;
  onClose: () => void;
}) {
  const t = useTranslations("interviews");
  const tc = useTranslations("common");

  const createMutation = useCreateInterview(applicationId);
  const updateMutation = useUpdateInterview(applicationId);

  const toLocalDatetime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState({
    scheduled_at: toLocalDatetime(interview?.scheduled_at) || "",
    duration_minutes: interview?.duration_minutes ?? 60,
    meeting_url: interview?.meeting_url ?? "",
    notes: interview?.notes ?? "",
    status: interview?.status ?? "scheduled",
  });

  const isEditing = !!interview;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!form.scheduled_at) {
      toast.error(t("scheduledAt") + " is required");
      return;
    }
    const payload = {
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      duration_minutes: form.duration_minutes,
      meeting_url: form.meeting_url || undefined,
      notes: form.notes || undefined,
      status: form.status,
    };
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: interview.id, data: payload });
        toast.success(t("scheduled"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("scheduled"));
      }
      onClose();
    } catch {
      toast.error(tc("error"));
    }
  };

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {isEditing ? t("schedule") : t("new")}
        </p>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">{t("scheduledAt")} *</label>
          <input
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">{t("duration")}</label>
          <input
            type="number"
            min={15}
            step={15}
            value={form.duration_minutes}
            onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1">{t("meetingUrl")}</label>
        <input
          type="url"
          value={form.meeting_url}
          onChange={(e) => setForm((f) => ({ ...f, meeting_url: e.target.value }))}
          placeholder="https://meet.google.com/..."
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-foreground mb-1">{t("notes")}</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {isEditing && (
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">{tc("status")}</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="scheduled">{t("status.scheduled")}</option>
            <option value="completed">{t("status.completed")}</option>
            <option value="cancelled">{t("status.cancelled")}</option>
          </select>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isPending ? tc("saving") : tc("save")}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-all"
        >
          {tc("cancel")}
        </button>
      </div>
    </div>
  );
}

// ─── Interview Card ───────────────────────────────────────────────────────────
function InterviewCard({
  interview,
  applicationId,
}: {
  interview: Interview;
  applicationId: string;
}) {
  const t = useTranslations("interviews");
  const tc = useTranslations("common");
  const [editing, setEditing] = useState(false);
  const deleteMutation = useDeleteInterview(applicationId);

  const handleDelete = async () => {
    if (!confirm(tc("confirm"))) return;
    try {
      await deleteMutation.mutateAsync(interview.id);
      toast.success(t("deleted"));
    } catch {
      toast.error(tc("error"));
    }
  };

  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-500/10 text-blue-500",
    completed: "bg-green-500/10 text-green-500",
    cancelled: "bg-destructive/10 text-destructive",
  };

  if (editing) {
    return (
      <InterviewForm
        applicationId={applicationId}
        interview={interview}
        onClose={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          {/* Date & time */}
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            {formatDate(interview.scheduled_at)}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {interview.duration_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {interview.duration_minutes} min
              </span>
            )}
            {interview.recruiter && (
              <span className="flex items-center gap-1">
                👤 {interview.recruiter.email}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[interview.status] ?? ""}`}>
              {t(`status.${interview.status}` as any)}
            </span>
          </div>

          {interview.meeting_url && (
            <a
              href={interview.meeting_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Video className="w-3.5 h-3.5" />
              {interview.meeting_url}
            </a>
          )}

          {interview.notes && (
            <p className="text-xs text-muted-foreground italic">{interview.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section (embedded in application detail) ───────────────────────────
export function InterviewsSection({ applicationId }: { applicationId: string }) {
  const t = useTranslations("interviews");
  const { data: interviews, isLoading } = useInterviews(applicationId);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in-delay-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          {t("title")}
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> {t("schedule")}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {showForm && (
          <InterviewForm
            applicationId={applicationId}
            onClose={() => setShowForm(false)}
          />
        )}

        {isLoading ? (
          <div className="h-16 bg-muted/40 rounded-xl animate-pulse" />
        ) : interviews?.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground">{t("noInterviews")}</p>
        ) : (
          interviews?.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              applicationId={applicationId}
            />
          ))
        )}
      </div>
    </div>
  );
}
