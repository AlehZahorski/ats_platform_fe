// Public company shapes — what /firmy and /firmy/{slug} consume.
// Matches CompanyPublicSummary / CompanyPublicDetail on the backend.
// Internal/ATS-side company fields live elsewhere; keep this module clean.

export interface CompanyTimelineEntry {
  year: number;
  title: string;
  description?: string | null;
}

export interface HowWeWorkCard {
  // Icon name maps to a lucide-react icon on the frontend.
  icon: string;
  title: string;
  description: string;
}

export interface RecruitmentStep {
  name: string;
  // Free-form ("15 min", "60 min", null) — never assume a parseable unit.
  duration: string | null;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface GalleryItem {
  url: string;
  caption?: string | null;
}

export interface CompanyPublicSummary {
  id: string;
  slug: string | null;
  name: string;
  is_verified: boolean;
  logo_url: string | null;
  banner_url: string | null;
  tagline: string | null;
  industry: string | null;
  employee_count: number | null;
  hq_location: string | null;
  founded_year: number | null;
  remote_percentage: number | null;
  tech_stack: string[];
  open_jobs_count: number;
}

export interface CompanyPublicDetail extends CompanyPublicSummary {
  description: string | null;
  website: string | null;
  how_we_work: HowWeWorkCard[];
  benefits: string[];
  recruitment_process: RecruitmentStep[];
  timeline: CompanyTimelineEntry[];
  faq: FaqEntry[];
  gallery: GalleryItem[];
}

export interface CompanyPublicList {
  items: CompanyPublicSummary[];
  total: number;
}

// Mirror of SavedCompanyRead. Same shape as SavedJob — `*_id` + meta.
export interface SavedCompany {
  id: string;
  company_id: string;
  created_at: string;
}


// ─────────────────────────────────────────────────────────────────────
// Owner-side "my company" — what /dashboard/settings/company-profile reads
// and writes. Mirrors CompanyRead on the backend; includes every field the
// dashboard editor needs to round-trip.
// ─────────────────────────────────────────────────────────────────────
export interface MyCompany {
  id: string;
  name: string;
  is_verified: boolean;
  created_at: string;

  slug: string | null;
  logo_url: string | null;
  banner_url: string | null;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  employee_count: number | null;
  hq_location: string | null;
  founded_year: number | null;
  website: string | null;
  remote_percentage: number | null;

  tech_stack: string[];
  how_we_work: HowWeWorkCard[];
  benefits: string[];
  recruitment_process: RecruitmentStep[];
  timeline: CompanyTimelineEntry[];
  faq: FaqEntry[];
  gallery: GalleryItem[];
}

/** PATCH /company payload. Only fields the user actually edits are sent —
 * undefined keys are dropped by JSON.stringify, so the backend leaves the
 * corresponding columns alone (exclude_unset on the pydantic side). */
export type CompanyEditPayload = Partial<{
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  employee_count: number | null;
  hq_location: string | null;
  founded_year: number | null;
  website: string | null;
  remote_percentage: number | null;
  tech_stack: string[];
  how_we_work: HowWeWorkCard[];
  benefits: string[];
  recruitment_process: RecruitmentStep[];
  timeline: CompanyTimelineEntry[];
  faq: FaqEntry[];
}>;
