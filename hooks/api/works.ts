import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useWorks() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/works");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "works" : null,
    fetcher
  );

  return {
    works: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useWork(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    console.warn("❗ [useWork] id no está definido");
    return { work: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `works/${id}` : null,
    () => {
      return apiClient.get(`/works/${id}`);
    }
  );

  return {
    work: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const workApi = {
  create: (data: any) => {
    return apiClient.post("/works", data);
  },
  update: (id: string, data: any) => {
    if (!id) {
      console.warn("❗ [workApi.update] id no está definido");
      throw new Error("ID de obra no está definido");
    }
    return apiClient.put(`/works/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      console.warn("❗ [workApi.delete] id no está definido");
      throw new Error("ID de obra no está definido");
    }
    return apiClient.delete(`/works/${id}`);
  },
};

