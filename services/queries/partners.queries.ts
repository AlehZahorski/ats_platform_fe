import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminPartnersApi,
  type PartnerTokenCreatePayload,
  type PartnerTokenUpdatePayload,
} from "@/services/api/partners";

// Reuse the admin-session flag convention so anonymous /admin pages don't
// fire the query before login.
const ADMIN_SESSION_FLAG = "wakanta_admin_session";
function hasAdminSessionFlag(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_SESSION_FLAG) === "1";
}

export const partnerKeys = {
  list: (q: string) => ["admin", "partners", "list", q] as const,
};

export function useAdminPartners(q: string) {
  return useQuery({
    queryKey: partnerKeys.list(q),
    queryFn: () => adminPartnersApi.list({ q: q || undefined, limit: 200 }).then((r) => r.data),
    enabled: hasAdminSessionFlag(),
    placeholderData: (prev) => prev,
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["admin", "partners", "list"] });
}

export function useCreatePartnerToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PartnerTokenCreatePayload) =>
      adminPartnersApi.create(data).then((r) => r.data),
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdatePartnerToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PartnerTokenUpdatePayload }) =>
      adminPartnersApi.update(id, data).then((r) => r.data),
    onSuccess: () => invalidate(qc),
  });
}

export function useRegeneratePartnerToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminPartnersApi.regenerate(id).then((r) => r.data),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeletePartnerToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminPartnersApi.delete(id),
    onSuccess: () => invalidate(qc),
  });
}
