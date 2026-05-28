import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamApi } from "@/services/api/team";
import type { InvitableRole } from "@/types";

export const teamKeys = {
  members: ["team", "members"] as const,
  invitations: ["team", "invitations"] as const,
  invitationByToken: (token: string) => ["team", "invitation", token] as const,
};

export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.members,
    queryFn: () => teamApi.listMembers().then((r) => r.data),
  });
}

export function usePendingInvitations() {
  return useQuery({
    queryKey: teamKeys.invitations,
    queryFn: () => teamApi.listInvitations().then((r) => r.data),
  });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role: InvitableRole }) =>
      teamApi.createInvitation(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.invitations }),
  });
}

export function useResendInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamApi.resendInvitation(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.invitations }),
  });
}

export function useRevokeInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamApi.revokeInvitation(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.invitations }),
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: InvitableRole }) =>
      teamApi.updateRole(userId, role).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.members }),
  });
}

export function useSetMemberActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      teamApi.setActive(userId, isActive).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: teamKeys.members }),
  });
}

// Public — accept flow
export function useInvitationPreview(token: string | null) {
  return useQuery({
    queryKey: teamKeys.invitationByToken(token ?? ""),
    queryFn: () => teamApi.getInvitation(token!).then((r) => r.data),
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      teamApi.acceptInvitation(data).then((r) => r.data),
    onSuccess: () => qc.clear(),
  });
}
