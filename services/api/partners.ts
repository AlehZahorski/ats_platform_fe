import apiClient from "./client";
import type { PartnerToken, PartnerTokenList } from "@/entities/partner";

// ── Admin: partner access tokens ─────────────────────────────────────
export interface PartnerTokenCreatePayload {
  label:       string;
  deck?:       "investor" | "partner";
  note?:       string | null;
  expires_at?: string | null;
  max_views?:  number | null;
}

export type PartnerTokenUpdatePayload = Partial<
  PartnerTokenCreatePayload & { is_active: boolean }
>;

export const adminPartnersApi = {
  list: (params: { q?: string; skip?: number; limit?: number } = {}) =>
    apiClient.get<PartnerTokenList>("/admin/partners", { params }),
  create: (data: PartnerTokenCreatePayload) =>
    apiClient.post<PartnerToken>("/admin/partners", data),
  update: (id: string, data: PartnerTokenUpdatePayload) =>
    apiClient.patch<PartnerToken>(`/admin/partners/${id}`, data),
  regenerate: (id: string) =>
    apiClient.post<PartnerToken>(`/admin/partners/${id}/regenerate`),
  delete: (id: string) => apiClient.delete(`/admin/partners/${id}`),
};

// ── Public: presentation gate ────────────────────────────────────────
export const presentationApi = {
  access: (token: string) =>
    apiClient.post<{ html: string }>("/presentation/access", { token }),
};
