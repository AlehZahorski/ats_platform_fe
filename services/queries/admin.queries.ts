import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminAuthApi,
  adminArticlesApi,
  adminUsageApi,
  type AdminArticlesParams,
  type AdminArticleCreatePayload,
  type AdminArticleUpdatePayload,
} from "@/services/api/admin";
import type { AdminArticle } from "@/entities/admin";


// Mirror of the candidate-session flag — anonymous /admin pages should
// never fire /admin/auth/me. The login mutation flips the flag on, logout
// flips it off.
const ADMIN_SESSION_FLAG = "wakanta_admin_session";

export function markAdminSession(active: boolean) {
  if (typeof window === "undefined") return;
  if (active) window.localStorage.setItem(ADMIN_SESSION_FLAG, "1");
  else window.localStorage.removeItem(ADMIN_SESSION_FLAG);
}

function hasAdminSessionFlag(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_SESSION_FLAG) === "1";
}


export const adminKeys = {
  me: ["admin", "me"] as const,
  usage: (days: number) => ["admin", "usage", days] as const,
  articlesList: (params: AdminArticlesParams) => ["admin", "articles", "list", params] as const,
  articleDetail: (id: string) => ["admin", "articles", "detail", id] as const,
};


// ── Auth ─────────────────────────────────────────────────────────────
export function useAdminMe() {
  return useQuery({
    queryKey: adminKeys.me,
    queryFn: () => adminAuthApi.me().then((r) => r.data),
    enabled: hasAdminSessionFlag(),
    retry: false,
    staleTime: 60_000,
  });
}


// ── AI usage analytics ───────────────────────────────────────────────
export function useAdminUsage(days: number) {
  return useQuery({
    queryKey: adminKeys.usage(days),
    queryFn: () => adminUsageApi.get(days).then((r) => r.data),
    enabled: hasAdminSessionFlag(),
  });
}

export function useAdminLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      adminAuthApi.login(data).then((r) => r.data),
    onSuccess: (data) => {
      markAdminSession(true);
      qc.setQueryData(adminKeys.me, data);
    },
  });
}

export function useAdminLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminAuthApi.logout(),
    onSuccess: () => {
      markAdminSession(false);
      qc.removeQueries({ queryKey: ["admin"] });
    },
  });
}


// ── Articles ─────────────────────────────────────────────────────────
export function useAdminArticles(params: AdminArticlesParams) {
  return useQuery({
    queryKey: adminKeys.articlesList(params),
    queryFn: () => adminArticlesApi.list(params).then((r) => r.data),
    enabled: hasAdminSessionFlag(),
    placeholderData: (prev) => prev,
  });
}

export function useAdminArticle(id: string | null) {
  return useQuery({
    queryKey: adminKeys.articleDetail(id ?? ""),
    queryFn: () => adminArticlesApi.get(id!).then((r) => r.data),
    enabled: !!id && hasAdminSessionFlag(),
    retry: false,
  });
}

function invalidateLists(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["admin", "articles", "list"] });
  qc.invalidateQueries({ queryKey: ["articles"] }); // also blow public caches
}

export function useCreateAdminArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminArticleCreatePayload) =>
      adminArticlesApi.create(data).then((r) => r.data),
    onSuccess: () => invalidateLists(qc),
  });
}

export function useUpdateAdminArticle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminArticleUpdatePayload) =>
      adminArticlesApi.update(id, data).then((r) => r.data),
    onSuccess: (data: AdminArticle) => {
      qc.setQueryData(adminKeys.articleDetail(id), data);
      invalidateLists(qc);
    },
  });
}

export function useDeleteAdminArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminArticlesApi.delete(id),
    onSuccess: () => invalidateLists(qc),
  });
}

export function useTogglePublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminArticlesApi.togglePublish(id).then((r) => r.data),
    onSuccess: (data: AdminArticle) => {
      qc.setQueryData(adminKeys.articleDetail(data.id), data);
      invalidateLists(qc);
    },
  });
}

export function useToggleFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminArticlesApi.toggleFeature(id).then((r) => r.data),
    onSuccess: (data: AdminArticle) => {
      qc.setQueryData(adminKeys.articleDetail(data.id), data);
      invalidateLists(qc);
    },
  });
}

/** Promote a company article into the editorial /poradnik feed.
 * Pass `days` = null to unpromote (clears the flag + window). */
export function usePromoteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, days }: { id: string; days: number | null }) =>
      adminArticlesApi.promote(id, days).then((r) => r.data),
    onSuccess: (data: AdminArticle) => {
      qc.setQueryData(adminKeys.articleDetail(data.id), data);
      invalidateLists(qc);
    },
  });
}

export function useUploadArticleCover(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => adminArticlesApi.uploadCover(id, file).then((r) => r.data),
    onSuccess: (data: AdminArticle) => {
      qc.setQueryData(adminKeys.articleDetail(id), data);
      invalidateLists(qc);
    },
  });
}

export function useRemoveArticleCover(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminArticlesApi.removeCover(id).then((r) => r.data),
    onSuccess: (data: AdminArticle) => {
      qc.setQueryData(adminKeys.articleDetail(id), data);
      invalidateLists(qc);
    },
  });
}
