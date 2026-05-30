// Admin identity — mirror of AdminRead on the backend. Kept narrow on
// purpose: passwords never come back, refresh tokens live in cookies.

export interface Admin {
  id:            string;
  email:         string;
  full_name:     string | null;
  is_active:     boolean;
  last_login_at: string | null;
  created_at:    string;
}

// Admin-side article shape. Extends the public detail with the publish
// flag + timestamps (drafts are hidden from /poradnik but visible here).
import type { ArticleDetail } from "./article";

export interface AdminArticle extends ArticleDetail {
  is_published: boolean;
  created_at:   string;
  updated_at:   string;
}

export interface AdminArticleList {
  items: AdminArticle[];
  total: number;
}

// ── AI usage analytics (F-23) ───────────────────────────────────────────────
// Mirrors app/modules/admins/usage_schemas.py. Field names match the ORM
// (input_tokens / output_tokens / llm_model); total_tokens is server-derived.

export interface UsageOverview {
  total_calls: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  total_cost_usd: number;
  companies_using: number;
  period_days: number | null;
}

export interface CompanyUsageRow {
  company_id: string;
  company_name: string;
  calls: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  last_used_at: string | null;
}

export interface OperationUsageRow {
  operation: string;
  calls: number;
  total_tokens: number;
  cost_usd: number;
}

export interface ModelUsageRow {
  llm_model: string | null;
  calls: number;
  total_tokens: number;
  cost_usd: number;
}

export interface RecentUsageRow {
  id: string;
  company_id: string;
  company_name: string;
  operation: string;
  llm_model: string | null;
  prompt_name: string | null;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  created_at: string;
}

export interface AdminUsageReport {
  overview: UsageOverview;
  by_company: CompanyUsageRow[];
  by_operation: OperationUsageRow[];
  by_model: ModelUsageRow[];
  recent: RecentUsageRow[];
}
