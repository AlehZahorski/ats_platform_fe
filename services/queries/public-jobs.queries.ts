import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api/client";
import type { PublicJobDetail } from "@/entities/job";

export function usePublicJob(jobId: string) {
  return useQuery({
    queryKey: ["public-job", jobId],
    queryFn: async () => {
      const response = await apiClient.get<PublicJobDetail>(`/jobs/public/${jobId}`);
      return response.data;
    },
    retry: false,
  });
}
