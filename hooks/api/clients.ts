import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useClients() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/clients");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "clients" : null,
    fetcher
  );

  return {
    clients: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useClient(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    console.warn("❗ [useClient] id no está definido");
    return { client: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `clients/${id}` : null,
    () => {
      return apiClient.get(`/clients/${id}`);
    }
  );

  return {
    client: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const clientApi = {
  create: (data: any) => {
    return apiClient.post("/clients", data);
  },
  update: (id: string, data: any) => {
    if (!id) {
      console.warn("❗ [clientApi.update] id no está definido");
      throw new Error("ID de cliente no está definido");
    }
    return apiClient.put(`/clients/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      console.warn("❗ [clientApi.delete] id no está definido");
      throw new Error("ID de cliente no está definido");
    }
    return apiClient.delete(`/clients/${id}`);
  },
};
