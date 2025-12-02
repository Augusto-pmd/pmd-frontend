import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_DOCUMENTS } from "@/lib/useSimulation";

const API_BASE = safeApiUrl("/documents");

export function useDocuments(workId?: string) {
  const { token } = useAuthStore();
  
  // Si está en modo simulación, usar un fetcher que retorna datos dummy
  const fetcher = SIMULATION_MODE
    ? () => {
        let filteredDocuments = [...SIMULATED_DOCUMENTS];
        if (workId) {
          filteredDocuments = filteredDocuments.filter((doc) => doc.workId === workId);
        }
        return Promise.resolve({ data: filteredDocuments });
      }
    : async () => {
        if (!API_BASE) {
          throw new Error("API_BASE no está definido correctamente");
        }
        try {
          const url = workId ? `${API_BASE}?workId=${workId}` : API_BASE;
          return await apiClient.get(url);
        } catch (err: any) {
          // Si el endpoint no existe, retornar array vacío
          if (err.response?.status === 404) {
            return [];
          }
          throw err;
        }
      };
  
  if (!API_BASE && !SIMULATION_MODE) {
    console.error("🔴 [useDocuments] API_BASE es inválido");
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    SIMULATION_MODE || (token && API_BASE) ? `documents${workId ? `-${workId}` : ""}` : null,
    fetcher
  );

  return {
    documents: data?.data || data || [],
    error,
    isLoading: SIMULATION_MODE ? false : isLoading,
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

