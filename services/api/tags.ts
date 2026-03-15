import apiClient from "./client";
import type { Tag } from "@/types";

export const tagsApi = {
  list: () => apiClient.get<Tag[]>("/tags"),
  create: (name: string) => apiClient.post<Tag>("/tags", { name }),
};
