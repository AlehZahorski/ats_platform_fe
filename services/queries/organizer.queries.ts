import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  organizerApi,
  usersApi,
  type ScheduleUpsertPayload,
} from "@/services/api/organizer";
import type { AvatarKey } from "@/entities/user";
import { authKeys } from "./auth.queries";

export const organizerKeys = {
  board: (week_start: string, scope: "self" | "team") =>
    ["organizer", "board", week_start, scope] as const,
  day: (user_id: string, date: string) =>
    ["organizer", "day", user_id, date] as const,
};

export function useOrganizerBoard(params: { week_start: string; scope: "self" | "team" }) {
  return useQuery({
    queryKey: organizerKeys.board(params.week_start, params.scope),
    queryFn: () => organizerApi.board(params).then((r) => r.data),
  });
}

export function useOrganizerDay(params: { user_id: string; date: string; enabled?: boolean }) {
  return useQuery({
    queryKey: organizerKeys.day(params.user_id, params.date),
    queryFn: () => organizerApi.day(params).then((r) => r.data),
    enabled: params.enabled ?? true,
  });
}

export function useUpsertSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ScheduleUpsertPayload) =>
      organizerApi.upsertSchedule(data).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["organizer", "board"] });
      qc.invalidateQueries({ queryKey: organizerKeys.day(vars.user_id, vars.date) });
    },
  });
}

export function useUpdateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (avatar_key: AvatarKey | null) =>
      usersApi.updateAvatar(avatar_key).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.me });
      qc.invalidateQueries({ queryKey: ["organizer", "board"] });
    },
  });
}
