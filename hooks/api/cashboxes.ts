import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/cashboxes`;

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

const CASH_MOVEMENTS_BASE = `${process.env.NEXT_PUBLIC_API_URL}/cash-movements`;

export function useCashMovements(cashboxId?: string) {
  const { token } = useAuthStore();
  const endpoint = cashboxId
    ? `${CASH_MOVEMENTS_BASE}?cashboxId=${cashboxId}`
    : CASH_MOVEMENTS_BASE;
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
  create: (data: any) => apiClient.post(CASH_MOVEMENTS_BASE, data),
  update: (id: string, data: any) =>
    apiClient.put(`${CASH_MOVEMENTS_BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${CASH_MOVEMENTS_BASE}/${id}`),
};

