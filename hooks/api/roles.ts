import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = "/roles";

export function useRoles() {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token ? API_BASE : null,
    () => apiClient.get(API_BASE)
  );

  return {
    roles: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useRole(id: string | null) {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `${API_BASE}/${id}` : null,
    () => apiClient.get(`${API_BASE}/${id}`)
  );

  return {
    role: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const roleApi = {
  create: (data: any) => apiClient.post(API_BASE, data),
  update: (id: string, data: any) => apiClient.put(`${API_BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${API_BASE}/${id}`),
};

