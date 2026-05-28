import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  companiesApi,
  myCompanyApi,
  savedCompaniesApi,
  type PublicCompaniesParams,
} from "@/services/api/companies";
import type { CompanyEditPayload, MyCompany } from "@/entities/company";

// Reuse the candidate-session flag set by jobBoard.queries to keep
// "Obserwuj firmę" symmetric with saved jobs: zero requests for anons.
const SESSION_FLAG_KEY = "wakanta_candidate_session";

function hasCandidateSessionFlag(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SESSION_FLAG_KEY) === "1";
}


export const companiesKeys = {
  list: (params: PublicCompaniesParams) => ["companies", "list", params] as const,
  detail: (slug: string) => ["companies", "detail", slug] as const,
  jobs: (slug: string) => ["companies", "jobs", slug] as const,
  savedCompanies: ["candidate", "savedCompanies"] as const,
  myCompany: ["company", "me"] as const,
};


// ── Public list / detail / jobs ──────────────────────────────────────
export function usePublicCompanies(params: PublicCompaniesParams) {
  return useQuery({
    queryKey: companiesKeys.list(params),
    queryFn: () => companiesApi.listPublic(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function usePublicCompanyDetail(slug: string | null) {
  return useQuery({
    queryKey: companiesKeys.detail(slug ?? ""),
    queryFn: () => companiesApi.detailPublic(slug!).then((r) => r.data),
    enabled: !!slug,
    retry: false,
  });
}

export function usePublicCompanyJobs(slug: string | null, limit = 6) {
  return useQuery({
    queryKey: [...companiesKeys.jobs(slug ?? ""), limit],
    queryFn: () => companiesApi.jobsPublic(slug!, { limit }).then((r) => r.data),
    enabled: !!slug,
  });
}


// ── My company (owner dashboard editor) ──────────────────────────────
// Every mutation writes the freshly-returned MyCompany straight into the
// query cache. This means the editor UI re-renders with server-validated
// state (slug, applied uploads etc.) without an extra round-trip.
export function useMyCompany() {
  return useQuery({
    queryKey: companiesKeys.myCompany,
    queryFn: () => myCompanyApi.get().then((r) => r.data),
  });
}

export function useUpdateMyCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyEditPayload) => myCompanyApi.update(payload).then((r) => r.data),
    onSuccess: (data: MyCompany) => {
      qc.setQueryData(companiesKeys.myCompany, data);
      // Public list/profile caches may show this company — invalidate so a
      // freshly-saved name or tagline propagates next time the user lands
      // on /firmy without a hard refresh.
      qc.invalidateQueries({ queryKey: ["companies", "list"] });
      if (data.slug) qc.invalidateQueries({ queryKey: companiesKeys.detail(data.slug) });
    },
  });
}

export function useUploadCompanyLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => myCompanyApi.uploadLogo(file).then((r) => r.data),
    onSuccess: (data: MyCompany) => qc.setQueryData(companiesKeys.myCompany, data),
  });
}
export function useRemoveCompanyLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => myCompanyApi.removeLogo().then((r) => r.data),
    onSuccess: (data: MyCompany) => qc.setQueryData(companiesKeys.myCompany, data),
  });
}

export function useUploadCompanyBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => myCompanyApi.uploadBanner(file).then((r) => r.data),
    onSuccess: (data: MyCompany) => qc.setQueryData(companiesKeys.myCompany, data),
  });
}
export function useRemoveCompanyBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => myCompanyApi.removeBanner().then((r) => r.data),
    onSuccess: (data: MyCompany) => qc.setQueryData(companiesKeys.myCompany, data),
  });
}

export function useUploadGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => myCompanyApi.uploadGalleryItem(file).then((r) => r.data),
    onSuccess: (data: MyCompany) => qc.setQueryData(companiesKeys.myCompany, data),
  });
}
export function useRemoveGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (index: number) => myCompanyApi.removeGalleryItem(index).then((r) => r.data),
    onSuccess: (data: MyCompany) => qc.setQueryData(companiesKeys.myCompany, data),
  });
}


// ── Saved companies — gated on candidate session ─────────────────────
export function useSavedCompanies() {
  return useQuery({
    queryKey: companiesKeys.savedCompanies,
    queryFn: () => savedCompaniesApi.list().then((r) => r.data),
    enabled: hasCandidateSessionFlag(),
    retry: false,
  });
}

export function useToggleSavedCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, save }: { companyId: string; save: boolean }) =>
      save ? savedCompaniesApi.save(companyId) : savedCompaniesApi.unsave(companyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companiesKeys.savedCompanies });
    },
  });
}
