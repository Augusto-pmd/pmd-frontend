import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useDashboardStats() {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token ? "/dashboard/stats" : null,
    () => apiClient.get("/dashboard/stats")
  );

  return {
    stats: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

