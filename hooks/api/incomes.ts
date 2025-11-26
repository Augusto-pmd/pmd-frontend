import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = "/incomes";

export function useIncomes() {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token ? API_BASE : null,
    () => apiClient.get(API_BASE)
  );

  return {
    incomes: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useIncome(id: string | null) {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `${API_BASE}/${id}` : null,
    () => apiClient.get(`${API_BASE}/${id}`)
  );

  return {
    income: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const incomeApi = {
  create: (data: any) => apiClient.post(API_BASE, data),
  update: (id: string, data: any) => apiClient.put(`${API_BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${API_BASE}/${id}`),
};

