"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSavedCompanies,
  useToggleSavedCompany,
  companiesKeys,
} from "@/services/queries/companies.queries";
import { useCandidateMe } from "@/services/queries/jobBoard.queries";

const LS_KEY = "wakanta_saved_companies";

function readLs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLs(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

/**
 * Hybrid follow store — mirrors useSavedJobsSet.
 *
 *   Anonymous visitor → localStorage
 *   Logged-in candidate → DB via /candidates/me/saved-companies
 *
 * Same hook interface for both, so card UI doesn't branch on auth state.
 */
export function useSavedCompaniesSet() {
  const qc = useQueryClient();
  const { data: candidate } = useCandidateMe();
  const { data: dbRows } = useSavedCompanies();
  const toggleMut = useToggleSavedCompany();

  const isLoggedIn = !!candidate;

  const [lsIds, setLsIds] = useState<string[]>(() => readLs());
  useEffect(() => setLsIds(readLs()), []);

  const savedSet = useMemo(() => {
    if (isLoggedIn && dbRows) return new Set(dbRows.map((r) => r.company_id));
    return new Set(lsIds);
  }, [isLoggedIn, dbRows, lsIds]);

  const toggle = useCallback(
    async (companyId: string) => {
      const currentlySaved = savedSet.has(companyId);
      if (isLoggedIn) {
        await toggleMut.mutateAsync({ companyId, save: !currentlySaved });
        qc.invalidateQueries({ queryKey: companiesKeys.savedCompanies });
        return;
      }
      const next = currentlySaved ? lsIds.filter((x) => x !== companyId) : [...lsIds, companyId];
      setLsIds(next);
      writeLs(next);
    },
    [isLoggedIn, lsIds, qc, savedSet, toggleMut],
  );

  return { savedSet, toggle, isLoggedIn };
}
