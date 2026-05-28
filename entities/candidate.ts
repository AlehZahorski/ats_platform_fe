import type { AvatarKey } from "./user";

export interface Candidate {
  id: string;
  email: string;
  full_name: string | null;
  avatar_key: AvatarKey | null;
  phone: string | null;
  location: string | null;
  headline: string | null;
  language: string;
  is_verified: boolean;
  created_at: string;
}

export interface SavedJob {
  id: string;
  job_id: string;
  created_at: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: Record<string, unknown>;
  notify_email: boolean;
  created_at: string;
}
