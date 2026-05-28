import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  jobBoardApi,
  candidatesApi,
  type PublicJobsParams,
} from "@/services/api/jobBoard";
import type { Candidate } from "@/entities/candidate";

// ── Public job board ──────────────────────────────────────────────────
export const jobBoardKeys = {
  list: (params: PublicJobsParams) => ["jobBoard", "list", params] as const,
  detail: (id: string) => ["jobBoard", "detail", id] as const,
  stats: ["jobBoard", "stats"] as const,
  popular: ["jobBoard", "popular"] as const,
};

export function usePublicJobBoard(params: PublicJobsParams) {
  return useQuery({
    queryKey: jobBoardKeys.list(params),
    queryFn: () => jobBoardApi.listPublic(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function usePublicJobDetail(id: string | null) {
  return useQuery({
    queryKey: jobBoardKeys.detail(id ?? ""),
    queryFn: () => jobBoardApi.detailPublic(id!).then((r) => r.data),
    enabled: !!id,
    // Don't retry a 404 (stale ID after re-seed) into an endless loop.
    retry: false,
  });
}

export function usePublicStats() {
  return useQuery({
    queryKey: jobBoardKeys.stats,
    queryFn: () => jobBoardApi.stats().then((r) => r.data),
    staleTime: 60_000,
  });
}

export function usePopularCategories(limit = 8) {
  return useQuery({
    queryKey: [...jobBoardKeys.popular, limit],
    queryFn: () => jobBoardApi.popular(limit).then((r) => r.data),
    staleTime: 60_000,
  });
}

// ── Candidate auth ────────────────────────────────────────────────────
export const candidateKeys = {
  me: ["candidate", "me"] as const,
  savedJobs: ["candidate", "savedJobs"] as const,
  savedSearches: ["candidate", "savedSearches"] as const,
};

// Cookies are httpOnly so JS can't read them. We mirror a "user has a session"
// flag in localStorage on login/logout so anonymous visits never fire /me at
// all — keeps the public job board's network panel clean of 401s.
const SESSION_FLAG_KEY = "wakanta_candidate_session";

export function markCandidateSession(active: boolean) {
  if (typeof window === "undefined") return;
  if (active) window.localStorage.setItem(SESSION_FLAG_KEY, "1");
  else window.localStorage.removeItem(SESSION_FLAG_KEY);
}

function hasCandidateSessionFlag(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SESSION_FLAG_KEY) === "1";
}

export function useCandidateMe() {
  return useQuery({
    queryKey: candidateKeys.me,
    queryFn: () => candidatesApi.me().then((r) => r.data),
    // Only fire when we believe a session exists. Anonymous visitors never hit
    // the endpoint, so the console stays clean.
    enabled: hasCandidateSessionFlag(),
    retry: false,
    staleTime: 60_000,
  });
}

export function useCandidateSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string; full_name?: string }) =>
      candidatesApi.signup(data).then((r) => r.data),
    onSuccess: (data) => {
      markCandidateSession(true);
      qc.setQueryData(candidateKeys.me, data);
    },
  });
}

export function useCandidateLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      candidatesApi.login(data).then((r) => r.data),
    onSuccess: (data: Candidate) => {
      markCandidateSession(true);
      qc.setQueryData(candidateKeys.me, data);
    },
  });
}

export function useCandidateLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => candidatesApi.logout(),
    onSuccess: () => {
      markCandidateSession(false);
      qc.removeQueries({ queryKey: ["candidate"] });
    },
  });
}

// ── Saved jobs ────────────────────────────────────────────────────────
// Gated on candidate session: zero requests for anonymous visitors.
export function useSavedJobs() {
  return useQuery({
    queryKey: candidateKeys.savedJobs,
    queryFn: () => candidatesApi.listSavedJobs().then((r) => r.data),
    enabled: hasCandidateSessionFlag(),
    retry: false,
  });
}

export function useToggleSavedJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, save }: { jobId: string; save: boolean }) =>
      save ? candidatesApi.saveJob(jobId) : candidatesApi.unsaveJob(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: candidateKeys.savedJobs });
    },
  });
}

// ── Saved searches ────────────────────────────────────────────────────
export function useSavedSearches() {
  return useQuery({
    queryKey: candidateKeys.savedSearches,
    queryFn: () => candidatesApi.listSavedSearches().then((r) => r.data),
    enabled: hasCandidateSessionFlag(),
    retry: false,
  });
}
