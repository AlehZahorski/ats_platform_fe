import apiClient from "./client";
import type {
  ArticleDetail,
  ArticleList,
  ArticleSummary,
  CategoryCount,
} from "@/entities/article";

export interface PublicArticlesParams {
  q?:        string;
  category?: string;
  /** Article flavour. Defaults to 'editorial' server-side — pass 'company'
   *  for /firmy-pisza, 'all' if you want both intermixed. */
  type?:     "editorial" | "company" | "all";
  sort?:     "newest" | "oldest";
  skip?:     number;
  limit?:    number;
  exclude_featured?: boolean;
}

export const articlesApi = {
  listPublic: (params: PublicArticlesParams = {}) =>
    apiClient.get<ArticleList>("/articles/public", { params }),
  featured: (type?: "editorial" | "company" | "all") =>
    apiClient.get<ArticleSummary | null>("/articles/public/featured", { params: type ? { type } : {} }),
  categories: (type?: "editorial" | "company" | "all") =>
    apiClient.get<CategoryCount[]>("/articles/public/categories", { params: type ? { type } : {} }),
  detailPublic: (slug: string) =>
    apiClient.get<ArticleDetail>(`/articles/public/${slug}`),
};

export const newsletterApi = {
  subscribe: (data: { email: string; source?: string }) =>
    apiClient.post<{ email: string; subscribed_at: string; already_existed: boolean }>(
      "/articles/newsletter/subscribe",
      data,
    ),
};
