import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/audit`;

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

export function useAuditLog(id: string | null) {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `${API_BASE}/${id}` : null,
    () => apiClient.get(`${API_BASE}/${id}`)
  );

  return {
    log: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

