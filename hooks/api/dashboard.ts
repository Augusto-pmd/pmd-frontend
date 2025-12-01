import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`;

export function useDashboardStats() {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token ? API_BASE : null,
    () => apiClient.get(API_BASE)
  );

  return {
    stats: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

