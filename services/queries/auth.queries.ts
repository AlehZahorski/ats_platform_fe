import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/services/api/auth";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => authApi.me().then((r) => r.data),
    retry: false,
  });
}

export function useUsers(params?: { role?: string }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => authApi.listUsers(params).then((r) => r.data),
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => authApi.login(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: authKeys.me }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => qc.clear(),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (data: { company_name: string; email: string; password: string }) =>
      authApi.signupCompany(data),
  });
}
