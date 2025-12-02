import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/documents`;

export function useDocuments() {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token ? API_BASE : null,
    async () => {
      try {
        return await apiClient.get(API_BASE);
      } catch (err: any) {
        // Si el endpoint no existe, retornar array vacío
        if (err.response?.status === 404) {
          return [];
        }
        throw err;
      }
    }
  );

  return {
    documents: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useDocument(id: string | null) {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `${API_BASE}/${id}` : null,
    () => apiClient.get(`${API_BASE}/${id}`)
  );

  return {
    document: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const documentApi = {
  create: (data: any) => apiClient.post(API_BASE, data),
  update: (id: string, data: any) => apiClient.put(`${API_BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${API_BASE}/${id}`),
  download: (id: string) => `${API_BASE}/${id}/download`,
};

