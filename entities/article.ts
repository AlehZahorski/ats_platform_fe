// Public Poradnik shapes — mirror of ArticleSummary / ArticleDetail
// on the backend.

export interface ArticleAuthor {
  name:       string;
  role:       string | null;
  avatar_url: string | null;
}

/** Slim brand-company block, present only on type='company' articles.
 * Drives the brand byline + clickable chip → /firmy/{slug}. */
export interface ArticleBrandCompany {
  id:           string;
  slug:         string | null;
  name:         string;
  logo_url:     string | null;
  is_verified:  boolean;
}

export type ArticleType = "editorial" | "company";

export interface ArticleSummary {
  id:                string;
  slug:              string;
  title:             string;
  excerpt:           string | null;
  cover_image_url:   string | null;
  category:          string;
  is_featured:       boolean;
  // Promotion = admin lifted this company article into /poradnik for a window.
  is_promoted:       boolean;
  promoted_until:    string | null;
  type:              ArticleType;
  company:           ArticleBrandCompany | null;
  author:            ArticleAuthor;
  read_time_minutes: number | null;
  published_at:      string | null;
}

export interface ArticleDetail extends ArticleSummary {
  content: string; // HTML — rendered via dangerouslySetInnerHTML
}

export interface ArticleList {
  items: ArticleSummary[];
  total: number;
}

export interface CategoryCount {
  category: string;
  count:    number;
}

// Canonical category set, with PL labels. Keep in sync with the seeds:
// any new category there must show up here for the chip row to render it.
export const ARTICLE_CATEGORIES: { value: string; label: string }[] = [
  { value: "cv",            label: "CV i listy" },
  { value: "rozmowy",       label: "Rozmowy" },
  { value: "wynagrodzenia", label: "Wynagrodzenia" },
  { value: "kariera",       label: "Kariera" },
  { value: "rynek",         label: "Rynek" },
];

export function categoryLabel(value: string): string {
  return ARTICLE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
