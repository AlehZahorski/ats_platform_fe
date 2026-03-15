import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "@/services/api/applications";

export const appKeys = {
  all: ["applications"] as const,
  list: (params?: object) => ["applications", "list", params] as const,
  detail: (id: string) => ["applications", "detail", id] as const,
  notes: (id: string) => ["applications", "notes", id] as const,
  tags: (id: string) => ["applications", "tags", id] as const,
  track: (token: string) => ["applications", "track", token] as const,
};

export function useApplications(params?: object) {
  return useQuery({
    queryKey: appKeys.list(params),
    queryFn: () => applicationsApi.list(params as never).then((r) => r.data),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: appKeys.detail(id),
    queryFn: () => applicationsApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useTrackApplication(token: string) {
  return useQuery({
    queryKey: appKeys.track(token),
    queryFn: () => applicationsApi.track(token).then((r) => r.data),
    enabled: !!token,
  });
}

export function useNotes(applicationId: string) {
  return useQuery({
    queryKey: appKeys.notes(applicationId),
    queryFn: () => applicationsApi.getNotes(applicationId).then((r) => r.data),
    enabled: !!applicationId,
  });
}

export function useAddNote(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; visible_to_candidate: boolean }) =>
      applicationsApi.addNote(applicationId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: appKeys.notes(applicationId) }),
  });
}

export function useApplicationTags(applicationId: string) {
  return useQuery({
    queryKey: appKeys.tags(applicationId),
    queryFn: () => applicationsApi.getTags(applicationId).then((r) => r.data),
    enabled: !!applicationId,
  });
}

export function useUpdateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage_id, notify_candidate }: { id: string; stage_id: string; notify_candidate?: boolean }) =>
      applicationsApi.updateStage(id, { stage_id, notify_candidate }),
    onSuccess: () => qc.invalidateQueries({ queryKey: appKeys.all }),
  });
}

export function useScoreApplication(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { communication: number; technical: number; culture_fit: number }) =>
      applicationsApi.score(applicationId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: appKeys.detail(applicationId) }),
  });
}
