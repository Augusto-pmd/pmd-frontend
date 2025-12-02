import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";

const API_BASE = safeApiUrl("/documents");

export function useDocuments() {
  const { token } = useAuthStore();
  
  if (!API_BASE) {
    console.error("🔴 [useDocuments] API_BASE es inválido");
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && API_BASE ? API_BASE : null,
    async () => {
      if (!API_BASE) {
        throw new Error("API_BASE no está definido correctamente");
      }
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
  
  const documentUrl = id && API_BASE ? safeApiUrlWithParams("/documents", id) : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && documentUrl ? documentUrl : null,
    () => {
      if (!documentUrl) {
        throw new Error("URL de documento inválida");
      }
      return apiClient.get(documentUrl);
    }
  );

  return {
    document: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const documentApi = {
  create: (data: any) => {
    if (!API_BASE) throw new Error("API_BASE no está definido");
    return apiClient.post(API_BASE, data);
  },
  update: (id: string, data: any) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/documents", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/documents", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
  download: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/documents", id, "download");
    return url || null;
  },
};

