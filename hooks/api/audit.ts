import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = "/audit";

export function useAuditLogs(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  const queryString = params
    ? `?${new URLSearchParams(params as any).toString()}`
    : "";
  const { data, error, isLoading, mutate } = useSWR(
    token ? `${API_BASE}${queryString}` : null,
    () => apiClient.get(`${API_BASE}${queryString}`)
  );

  return {
    logs: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

