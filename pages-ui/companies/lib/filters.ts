/**
 * /firmy filter URL state — same pattern as the job board.
 *
 * Filters live in the URL so a shared link reproduces the listing
 * exactly. The list page reads this on every render; no local copy.
 */

export interface CompanyListFilters {
  q?: string;
  industry?: string[];
  size?: string[];            // 1-10 / 11-50 / 51-200 / 201-500 / 500+
  location?: string;
  work_mode?: string[];       // remote / hybrid / office
  verified_only?: boolean;
  sort?: "newest" | "jobs" | "name";
  tab?: "all" | "saved";
}

export function filtersFromQuery(sp: URLSearchParams): CompanyListFilters {
  const arr = (key: string) => {
    const all = sp.getAll(key);
    return all.length > 0 ? all : undefined;
  };
  return {
    q: sp.get("q") || undefined,
    industry: arr("industry"),
    size: arr("size"),
    location: sp.get("location") || undefined,
    work_mode: arr("work_mode"),
    verified_only: sp.get("verified_only") === "1" || undefined,
    sort: (sp.get("sort") as CompanyListFilters["sort"]) || "newest",
    tab: (sp.get("tab") as CompanyListFilters["tab"]) || "all",
  };
}

export function filtersToQuery(f: CompanyListFilters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.location) sp.set("location", f.location);
  for (const i of f.industry ?? []) sp.append("industry", i);
  for (const s of f.size ?? []) sp.append("size", s);
  for (const m of f.work_mode ?? []) sp.append("work_mode", m);
  if (f.verified_only) sp.set("verified_only", "1");
  if (f.sort && f.sort !== "newest") sp.set("sort", f.sort);
  if (f.tab && f.tab !== "all") sp.set("tab", f.tab);
  return sp;
}

export function toggleArr(list: string[] | undefined, value: string): string[] | undefined {
  const arr = list ?? [];
  const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
  return next.length > 0 ? next : undefined;
}

export function activeFilterCount(f: CompanyListFilters): number {
  let n = 0;
  if (f.q) n++;
  if (f.location) n++;
  if (f.industry?.length) n++;
  if (f.size?.length) n++;
  if (f.work_mode?.length) n++;
  if (f.verified_only) n++;
  return n;
}

// Curated set shown as quick chips above the grid. Matches the mockup.
// Extra industries can still be filtered via the sidebar list.
export const QUICK_INDUSTRY_CHIPS: { value: string; label: string; icon?: string }[] = [
  { value: "SaaS",        label: "SaaS" },
  { value: "Fintech",     label: "Fintech" },
  { value: "AI/ML",       label: "AI / ML" },
  { value: "E-commerce",  label: "E-commerce" },
  { value: "Gaming",      label: "Gaming" },
  { value: "Healthtech",  label: "Healthtech" },
  { value: "EdTech",      label: "EdTech" },
];

export const SIZE_BUCKETS = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

export const WORK_MODES_COMPANY: { value: string; label: string }[] = [
  { value: "remote", label: "Zdalna" },
  { value: "hybrid", label: "Hybrydowa" },
  { value: "office", label: "Stacjonarna" },
];
