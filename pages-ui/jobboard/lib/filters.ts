/**
 * Job-board filter URL state. Round-tripped through query string so:
 *   - Sharing a filter link works
 *   - Back/forward browser nav preserves state
 *   - Page refresh keeps the user where they were
 *
 * All values are arrays where the API accepts multi-select; strings/numbers
 * otherwise. Empty values are stripped on serialise to keep URLs clean.
 */

export interface JobBoardFilters {
  q?: string;
  category?: string[];
  work_mode?: string[];
  contract_type?: string[];
  seniority?: string[];
  employment_size?: string[];
  shift_system?: string[];
  qualification?: string[];      // backend param name
  verified_only?: boolean;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  sort?: "newest" | "salary_high" | "salary_low";
  tab?: "all" | "saved";
}

export function filtersFromQuery(sp: URLSearchParams): JobBoardFilters {
  const arr = (key: string) => {
    const all = sp.getAll(key);
    return all.length > 0 ? all : undefined;
  };
  const num = (key: string) => {
    const v = sp.get(key);
    return v ? Number(v) : undefined;
  };
  return {
    q: sp.get("q") || undefined,
    category: arr("category"),
    work_mode: arr("work_mode"),
    contract_type: arr("contract_type"),
    seniority: arr("seniority"),
    employment_size: arr("employment_size"),
    shift_system: arr("shift_system"),
    qualification: arr("qualification"),
    verified_only: sp.get("verified_only") === "1" || undefined,
    location: sp.get("location") || undefined,
    salary_min: num("salary_min"),
    salary_max: num("salary_max"),
    sort: (sp.get("sort") as JobBoardFilters["sort"]) || "newest",
    tab: (sp.get("tab") as JobBoardFilters["tab"]) || "all",
  };
}

export function filtersToQuery(f: JobBoardFilters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.location) sp.set("location", f.location);
  for (const c of f.category ?? []) sp.append("category", c);
  for (const m of f.work_mode ?? []) sp.append("work_mode", m);
  for (const c of f.contract_type ?? []) sp.append("contract_type", c);
  for (const s of f.seniority ?? []) sp.append("seniority", s);
  for (const e of f.employment_size ?? []) sp.append("employment_size", e);
  for (const sh of f.shift_system ?? []) sp.append("shift_system", sh);
  for (const q of f.qualification ?? []) sp.append("qualification", q);
  if (f.verified_only) sp.set("verified_only", "1");
  if (f.salary_min !== undefined) sp.set("salary_min", String(f.salary_min));
  if (f.salary_max !== undefined) sp.set("salary_max", String(f.salary_max));
  if (f.sort && f.sort !== "newest") sp.set("sort", f.sort);
  if (f.tab && f.tab !== "all") sp.set("tab", f.tab);
  return sp;
}

export function toggleArr(list: string[] | undefined, value: string): string[] | undefined {
  const arr = list ?? [];
  const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
  return next.length > 0 ? next : undefined;
}

/** How many filter groups are active. Drives the badge on the mobile
 * "Filtry" button so the user sees at a glance whether they have any active. */
export function activeFilterCount(f: JobBoardFilters): number {
  let n = 0;
  if (f.q) n++;
  if (f.location) n++;
  if (f.category && f.category.length) n++;
  if (f.work_mode && f.work_mode.length) n++;
  if (f.contract_type && f.contract_type.length) n++;
  if (f.seniority && f.seniority.length) n++;
  if (f.employment_size && f.employment_size.length) n++;
  if (f.shift_system && f.shift_system.length) n++;
  if (f.qualification && f.qualification.length) n++;
  if (f.verified_only) n++;
  if (f.salary_min !== undefined || f.salary_max !== undefined) n++;
  return n;
}

export function isFilterActive(f: JobBoardFilters): boolean {
  return activeFilterCount(f) > 0;
}
