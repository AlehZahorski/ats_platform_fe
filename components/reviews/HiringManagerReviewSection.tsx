"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ClipboardList, Send } from "lucide-react";
import { toast } from "sonner";
import { useMe, useUsers } from "@/services/queries/auth.queries";
import {
  useCreateReviewAssignment,
  useReviewAssignments,
  useReviewSummary,
  useScorecardTemplates,
  useSubmitReviewAssignment,
} from "@/services/queries";
import type { ReviewAssignment } from "@/types";
import { formatDate } from "@/lib/utils";

function getApiErrorMessage(error: unknown): string | null {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
  return typeof detail === "string" ? detail : null;
}

function AssignmentCard({
  assignment,
  canReview,
  applicationId,
}: {
  assignment: ReviewAssignment;
  canReview: boolean;
  applicationId: string;
}) {
  const t = useTranslations("reviews");
  const tc = useTranslations("common");
  const submitMutation = useSubmitReviewAssignment(applicationId);
  const [expanded, setExpanded] = useState(false);
  const [responses, setResponses] = useState<Record<string, { score: number; comment: string }>>(() => {
    const initial: Record<string, { score: number; comment: string }> = {};
    assignment.template.criteria.forEach((criterion) => {
      const existing = assignment.responses.find((item) => item.criterion_id === criterion.id);
      initial[criterion.id] = {
        score: existing?.score ?? Math.min(criterion.max_score, 3),
        comment: existing?.comment ?? "",
      };
    });
    return initial;
  });
  const [overallComment, setOverallComment] = useState(assignment.overall_comment ?? "");
  const [recommendation, setRecommendation] = useState(assignment.recommendation ?? "strong_yes");

  const averageScore = assignment.responses.length
    ? assignment.responses.reduce((sum, item) => sum + item.score, 0) / assignment.responses.length
    : null;

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync({
        assignmentId: assignment.id,
        data: {
          responses: assignment.template.criteria.map((criterion) => ({
            criterion_id: criterion.id,
            score: responses[criterion.id]?.score ?? 1,
            comment: responses[criterion.id]?.comment || undefined,
          })),
          overall_comment: overallComment || undefined,
          recommendation,
        },
      });
      toast.success(t("submitted"));
      setExpanded(false);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) ?? tc("error"));
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{assignment.reviewer?.email}</p>
          <p className="text-xs text-muted-foreground">
            {assignment.template.name} • {t(`status.${assignment.status}` as "status.pending" | "status.submitted")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {assignment.due_at && <span>{t("dueAt", { date: formatDate(assignment.due_at) })}</span>}
            {assignment.submitted_at && <span>{t("submittedAt", { date: formatDate(assignment.submitted_at) })}</span>}
            {averageScore !== null && <span>{t("averageScore", { score: averageScore.toFixed(1) })}</span>}
          </div>
        </div>
        {canReview && (
          <button
            onClick={() => setExpanded((value) => !value)}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {expanded ? tc("close") : assignment.status === "submitted" ? t("editReview") : t("fillScorecard")}
          </button>
        )}
      </div>

      {assignment.status === "submitted" && !expanded && (
        <div className="mt-4 space-y-2">
          {assignment.responses.map((response) => {
            const criterion = assignment.template.criteria.find((item) => item.id === response.criterion_id);
            return (
              <div key={response.id} className="rounded-lg bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{criterion?.label}</p>
                  <span className="text-xs font-semibold text-primary">
                    {response.score}/{criterion?.max_score}
                  </span>
                </div>
                {response.comment && <p className="mt-1 text-xs text-muted-foreground">{response.comment}</p>}
              </div>
            );
          })}
          {assignment.overall_comment && <p className="text-sm text-muted-foreground">{assignment.overall_comment}</p>}
        </div>
      )}

      {expanded && (
        <div className="mt-4 space-y-4 rounded-xl bg-muted/30 p-4">
          {assignment.template.criteria.map((criterion) => (
            <div key={criterion.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{criterion.label}</p>
                  {criterion.description && <p className="text-xs text-muted-foreground">{criterion.description}</p>}
                </div>
                <span className="text-xs font-semibold text-primary">
                  {responses[criterion.id]?.score ?? 1}/{criterion.max_score}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={criterion.max_score}
                value={responses[criterion.id]?.score ?? 1}
                onChange={(event) =>
                  setResponses((current) => ({
                    ...current,
                    [criterion.id]: {
                      ...current[criterion.id],
                      score: Number(event.target.value),
                    },
                  }))
                }
                className="w-full accent-primary"
              />
              <textarea
                value={responses[criterion.id]?.comment ?? ""}
                onChange={(event) =>
                  setResponses((current) => ({
                    ...current,
                    [criterion.id]: {
                      ...current[criterion.id],
                      comment: event.target.value,
                    },
                  }))
                }
                rows={2}
                placeholder={t("criterionComment")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          ))}

          <select
            value={recommendation}
            onChange={(event) => setRecommendation(event.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="strong_yes">{t("recommendations.strong_yes")}</option>
            <option value="yes">{t("recommendations.yes")}</option>
            <option value="no">{t("recommendations.no")}</option>
            <option value="strong_no">{t("recommendations.strong_no")}</option>
          </select>

          <textarea
            value={overallComment}
            onChange={(event) => setOverallComment(event.target.value)}
            rows={3}
            placeholder={t("overallComment")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />

          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {submitMutation.isPending ? tc("saving") : t("submit")}
          </button>
        </div>
      )}
    </div>
  );
}

export function HiringManagerReviewSection({ applicationId }: { applicationId: string }) {
  const t = useTranslations("reviews");
  const tc = useTranslations("common");
  const { data: currentUser } = useMe();
  const { data: managers } = useUsers({ role: "manager" });
  const { data: templates } = useScorecardTemplates();
  const { data: assignments, isLoading } = useReviewAssignments(applicationId);
  const { data: summary } = useReviewSummary(applicationId);
  const createAssignment = useCreateReviewAssignment(applicationId);

  const [reviewerId, setReviewerId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [dueAt, setDueAt] = useState("");

  const canAssign = currentUser?.role === "owner" || currentUser?.role === "recruiter";
  const assignmentForCurrentUser = useMemo(
    () => assignments?.find((item) => item.reviewer_id === currentUser?.id) ?? null,
    [assignments, currentUser?.id]
  );

  const handleAssign = async () => {
    if (!reviewerId || !templateId) {
      toast.error(tc("error"));
      return;
    }
    try {
      await createAssignment.mutateAsync({
        reviewer_id: reviewerId,
        template_id: templateId,
        due_at: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      setReviewerId("");
      setDueAt("");
      toast.success(t("assigned"));
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) ?? tc("error"));
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in-delay-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <ClipboardList className="h-4 w-4 text-primary" />
          {t("title")}
        </h3>
        {summary && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{t("summary.total", { count: summary.total_assignments })}</span>
            <span>{t("summary.pending", { count: summary.pending_count })}</span>
            <span>{t("summary.submitted", { count: summary.submitted_count })}</span>
            {summary.average_score !== null && <span>{t("summary.average", { score: summary.average_score.toFixed(1) })}</span>}
          </div>
        )}
      </div>

      {canAssign && (
        <div className="mb-5 grid gap-3 rounded-xl bg-muted/30 p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <select
            value={reviewerId}
            onChange={(event) => setReviewerId(event.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t("selectReviewer")}</option>
            {managers?.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.email}
              </option>
            ))}
          </select>

          <select
            value={templateId}
            onChange={(event) => setTemplateId(event.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t("selectTemplate")}</option>
            {templates?.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
            aria-label={t("dueDateLabel")}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <button
            onClick={handleAssign}
            disabled={createAssignment.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {createAssignment.isPending ? tc("saving") : t("assign")}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="h-20 rounded-xl bg-muted/40 animate-pulse" />
      ) : assignments?.length ? (
        <div className="space-y-3">
          {assignmentForCurrentUser && (
            <AssignmentCard assignment={assignmentForCurrentUser} canReview applicationId={applicationId} />
          )}
          {assignments
            ?.filter((item) => item.id !== assignmentForCurrentUser?.id)
            .map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} canReview={false} applicationId={applicationId} />
            ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("noAssignments")}</p>
      )}
    </div>
  );
}
