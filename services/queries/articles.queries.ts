import { useMutation, useQuery } from "@tanstack/react-query";
import {
  articlesApi,
  newsletterApi,
  type PublicArticlesParams,
} from "@/services/api/articles";

type ArticleType = "editorial" | "company" | "all";

export const articlesKeys = {
  list:       (params: PublicArticlesParams) => ["articles", "list", params] as const,
  featured:   (type?: ArticleType) => ["articles", "featured", type ?? "editorial"] as const,
  categories: (type?: ArticleType) => ["articles", "categories", type ?? "editorial"] as const,
  detail:     (slug: string) => ["articles", "detail", slug] as const,
};


export function usePublicArticles(params: PublicArticlesParams) {
  return useQuery({
    queryKey: articlesKeys.list(params),
    queryFn: () => articlesApi.listPublic(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useFeaturedArticle(type?: ArticleType) {
  return useQuery({
    queryKey: articlesKeys.featured(type),
    queryFn: () => articlesApi.featured(type).then((r) => r.data),
    // Featured doesn't change often; ~5 min is a sane stale window.
    staleTime: 5 * 60_000,
  });
}

export function useArticleCategories(type?: ArticleType) {
  return useQuery({
    queryKey: articlesKeys.categories(type),
    queryFn: () => articlesApi.categories(type).then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}

export function useArticleDetail(slug: string | null) {
  return useQuery({
    queryKey: articlesKeys.detail(slug ?? ""),
    queryFn: () => articlesApi.detailPublic(slug!).then((r) => r.data),
    enabled: !!slug,
    retry: false,
  });
}


export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: (data: { email: string; source?: string }) =>
      newsletterApi.subscribe(data).then((r) => r.data),
  });
}
