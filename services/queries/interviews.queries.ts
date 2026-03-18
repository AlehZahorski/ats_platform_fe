import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { interviewsApi, InterviewCreate } from "@/services/api/interviews";

export const interviewKeys = {
  all: ["interviews"] as const,
  byApplication: (applicationId: string) =>
    ["interviews", "application", applicationId] as const,
};

export function useInterviews(applicationId: string) {
  return useQuery({
    queryKey: interviewKeys.byApplication(applicationId),
    queryFn: () => interviewsApi.list(applicationId).then((r) => r.data),
    enabled: !!applicationId,
  });
}

export function useCreateInterview(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InterviewCreate) =>
      interviewsApi.create(applicationId, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: interviewKeys.byApplication(applicationId) }),
  });
}

export function useUpdateInterview(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InterviewCreate> }) =>
      interviewsApi.update(id, data).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: interviewKeys.byApplication(applicationId) }),
  });
}

export function useDeleteInterview(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (interviewId: string) => interviewsApi.delete(interviewId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: interviewKeys.byApplication(applicationId) }),
  });
}
