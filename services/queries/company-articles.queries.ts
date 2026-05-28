import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  companyArticlesApi,
  type CompanyArticlesParams,
  type CompanyArticleCreatePayload,
  type CompanyArticleUpdatePayload,
} from "@/services/api/company-articles";
import type { AdminArticle } from "@/entities/admin";


export const companyArticlesKeys = {
  list: (params: CompanyArticlesParams) => ["company", "articles", "list", params] as const,
  detail: (id: string) => ["company", "articles", "detail", id] as const,
};


export function useCompanyArticles(params: CompanyArticlesParams) {
  return useQuery({
    queryKey: companyArticlesKeys.list(params),
    queryFn: () => companyArticlesApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useCompanyArticle(id: string | null) {
  return useQuery({
    queryKey: companyArticlesKeys.detail(id ?? ""),
    queryFn: () => companyArticlesApi.get(id!).then((r) => r.data),
    enabled: !!id,
    retry: false,
  });
}


function invalidateLists(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["company", "articles", "list"] });
  // Public /firmy-pisza caches must refresh too — own-article publish
  // immediately bumps the brand-side grid.
  qc.invalidateQueries({ queryKey: ["articles"] });
}


export function useCreateCompanyArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CompanyArticleCreatePayload) =>
      companyArticlesApi.create(data).then((r) => r.data),
    onSuccess: () => invalidateLists(qc),
  });
}

export function useUpdateCompanyArticle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CompanyArticleUpdatePayload) =>
      companyArticlesApi.update(id, data).then((r) => r.data),
    onSuccess: (data: AdminArticle) => {
      qc.setQueryData(companyArticlesKeys.detail(id), data);
      invalidateLists(qc);
    },
  });
}

export function useDeleteCompanyArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companyArticlesApi.delete(id),
    onSuccess: () => invalidateLists(qc),
  });
}

export function useToggleCompanyPublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companyArticlesApi.togglePublish(id).then((r) => r.data),
    onSuccess: (data: AdminArticle) => {
      qc.setQueryData(companyArticlesKeys.detail(data.id), data);
      invalidateLists(qc);
    },
  });
}

export function useUploadCompanyArticleCover(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => companyArticlesApi.uploadCover(id, file).then((r) => r.data),
    onSuccess: (data: AdminArticle) => {
      qc.setQueryData(companyArticlesKeys.detail(id), data);
      invalidateLists(qc);
    },
  });
}

export function useRemoveCompanyArticleCover(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => companyArticlesApi.removeCover(id).then((r) => r.data),
    onSuccess: (data: AdminArticle) => {
      qc.setQueryData(companyArticlesKeys.detail(id), data);
      invalidateLists(qc);
    },
  });
}
