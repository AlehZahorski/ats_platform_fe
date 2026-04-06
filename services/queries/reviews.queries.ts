import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/services/api/reviews";

export const reviewKeys = {
  templates: ["reviews", "templates"] as const,
  assignments: (applicationId: string) => ["reviews", "assignments", applicationId] as const,
  summary: (applicationId: string) => ["reviews", "summary", applicationId] as const,
};

export function useScorecardTemplates() {
  return useQuery({
    queryKey: reviewKeys.templates,
    queryFn: () => reviewsApi.listTemplates().then((r) => r.data),
  });
}

export function useCreateScorecardTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: import("@/services/api/reviews").ScorecardTemplateCreatePayload) =>
      reviewsApi.createTemplate(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.templates }),
  });
}

export function useReviewAssignments(applicationId: string) {
  return useQuery({
    queryKey: reviewKeys.assignments(applicationId),
    queryFn: () => reviewsApi.listAssignments(applicationId).then((r) => r.data),
    enabled: !!applicationId,
  });
}

export function useReviewSummary(applicationId: string) {
  return useQuery({
    queryKey: reviewKeys.summary(applicationId),
    queryFn: () => reviewsApi.getSummary(applicationId).then((r) => r.data),
    enabled: !!applicationId,
  });
}

export function useCreateReviewAssignment(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: import("@/services/api/reviews").ReviewAssignmentCreatePayload) =>
      reviewsApi.createAssignment(applicationId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.assignments(applicationId) });
      qc.invalidateQueries({ queryKey: reviewKeys.summary(applicationId) });
    },
  });
}

export function useSubmitReviewAssignment(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: import("@/services/api/reviews").ReviewAssignmentSubmitPayload }) =>
      reviewsApi.submitAssignment(assignmentId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reviewKeys.assignments(applicationId) });
      qc.invalidateQueries({ queryKey: reviewKeys.summary(applicationId) });
    },
  });
}
