import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = "/cashboxes";

export function useCashboxes() {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token ? API_BASE : null,
    () => apiClient.get(API_BASE)
  );

  return {
    cashboxes: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useCashbox(id: string | null) {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `${API_BASE}/${id}` : null,
    () => apiClient.get(`${API_BASE}/${id}`)
  );

  return {
    cashbox: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const cashboxApi = {
  create: (data: any) => apiClient.post(API_BASE, data),
  update: (id: string, data: any) => apiClient.put(`${API_BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${API_BASE}/${id}`),
};

export function useCashMovements(cashboxId?: string) {
  const { token } = useAuthStore();
  const endpoint = cashboxId
    ? `/cash-movements?cashboxId=${cashboxId}`
    : "/cash-movements";
  const { data, error, isLoading, mutate } = useSWR(
    token ? endpoint : null,
    () => apiClient.get(endpoint)
  );

  return {
    movements: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export const cashMovementApi = {
  create: (data: any) => apiClient.post("/cash-movements", data),
  update: (id: string, data: any) =>
    apiClient.put(`/cash-movements/${id}`, data),
  delete: (id: string) => apiClient.delete(`/cash-movements/${id}`),
};

