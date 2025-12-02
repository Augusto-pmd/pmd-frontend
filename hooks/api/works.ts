import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";

// Construir API_BASE de forma segura
const API_BASE = safeApiUrl("/works");

export function useWorks() {
  const { token } = useAuthStore();
  
  // Validar que API_BASE sea válido antes de hacer el fetch
  if (!API_BASE) {
    console.error("🔴 [useWorks] API_BASE es inválido");
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && API_BASE ? API_BASE : null,
    () => {
      if (!API_BASE) {
        throw new Error("API_BASE no está definido correctamente");
      }
      return apiClient.get(API_BASE);
    }
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
  
  // Construir URL de forma segura
  const workUrl = id && API_BASE ? safeApiUrlWithParams("/works", id) : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && workUrl ? workUrl : null,
    () => {
      if (!workUrl) {
        throw new Error("URL de obra inválida");
      }
      return apiClient.get(workUrl);
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
    if (!API_BASE) throw new Error("API_BASE no está definido");
    return apiClient.post(API_BASE, data);
  },
  update: (id: string, data: any) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/works", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/works", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

