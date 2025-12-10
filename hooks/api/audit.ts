import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useAuditLogs(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  
  const queryString = params
    ? `?${new URLSearchParams(params as any).toString()}`
    : "";
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? `audit${queryString}` : null,
    () => {
      return apiClient.get(`/audit${queryString}`);
    }
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
  
  if (!id) {
    console.warn("❗ [useAuditLog] id no está definido");
    return { log: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `audit/${id}` : null,
    () => {
      return apiClient.get(`/audit/${id}`);
    }
  );

  return {
    log: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}
