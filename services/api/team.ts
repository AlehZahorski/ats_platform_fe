import apiClient from "./client";
import type { InvitableRole, InvitationPreview, User, UserInvitation } from "@/types";

export const teamApi = {
  // Members
  listMembers: () => apiClient.get<User[]>("/users"),

  updateRole: (userId: string, role: InvitableRole) =>
    apiClient.patch<User>(`/users/${userId}/role`, { role }),

  setActive: (userId: string, isActive: boolean) =>
    apiClient.patch<User>(`/users/${userId}/active`, { is_active: isActive }),

  // Invitations (owner)
  listInvitations: () => apiClient.get<UserInvitation[]>("/users/invitations"),

  createInvitation: (data: { email: string; role: InvitableRole }) =>
    apiClient.post<UserInvitation>("/users/invitations", data),

  resendInvitation: (id: string) =>
    apiClient.post<UserInvitation>(`/users/invitations/${id}/resend`),

  revokeInvitation: (id: string) =>
    apiClient.delete<UserInvitation>(`/users/invitations/${id}`),

  // Public — accept flow
  getInvitation: (token: string) =>
    apiClient.get<InvitationPreview>(`/auth/invitation/${token}`),

  acceptInvitation: (data: { token: string; password: string }) =>
    apiClient.post<User>("/auth/accept-invitation", data),
};
