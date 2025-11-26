import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = "/accounting";

export function useAccounting() {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token ? API_BASE : null,
    () => apiClient.get(API_BASE)
  );

  return {
    accounting: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingReport(id: string | null) {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `${API_BASE}/${id}` : null,
    () => apiClient.get(`${API_BASE}/${id}`)
  );

  return {
    report: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const accountingApi = {
  create: (data: any) => apiClient.post(API_BASE, data),
  update: (id: string, data: any) => apiClient.put(`${API_BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${API_BASE}/${id}`),
  generateReport: (params: any) => apiClient.post(`${API_BASE}/reports`, params),
};

