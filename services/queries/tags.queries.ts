import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsApi } from "@/services/api/tags";

export const tagKeys = {
  all: ["tags"] as const,
  list: () => ["tags", "list"] as const,
};

export function useTags() {
  return useQuery({
    queryKey: tagKeys.list(),
    queryFn: () => tagsApi.list().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => tagsApi.create(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: tagKeys.all }),
  });
}
