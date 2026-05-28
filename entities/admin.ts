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
