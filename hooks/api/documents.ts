import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

/**
 * @deprecated Use useWorkDocuments() from hooks/api/workDocuments.ts instead
 * This hook is maintained for backward compatibility but uses /work-documents endpoint
 */
export function useDocuments(workId?: string) {
  const { token } = useAuthStore();
  
  const fetcher = async () => {
    try {
      const url = workId ? `/work-documents?workId=${workId}` : "/work-documents";
      return await apiClient.get(url);
    } catch (err: any) {
      // Si el endpoint no existe, retornar array vacío
      if (err.response?.status === 404) {
        return [];
      }
      throw err;
    }
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? `work-documents${workId ? `-${workId}` : ""}` : null,
    fetcher
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
  
  if (!id) {
    console.warn("❗ [useDocument] id no está definido");
    return { document: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `work-documents/${id}` : null,
    () => {
      return apiClient.get(`/work-documents/${id}`);
    }
  );

  return {
    document: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

/**
 * @deprecated Use workDocumentApi from hooks/api/workDocuments.ts instead
 */
export const documentApi = {
  create: (data: any) => {
    return apiClient.post("/work-documents", data);
  },
  update: (id: string, data: any) => {
    if (!id) {
      console.warn("❗ [documentApi.update] id no está definido");
      throw new Error("ID de documento no está definido");
    }
    return apiClient.put(`/work-documents/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      console.warn("❗ [documentApi.delete] id no está definido");
      throw new Error("ID de documento no está definido");
    }
    return apiClient.delete(`/work-documents/${id}`);
  },
  download: (id: string) => {
    if (!id) {
      console.warn("❗ [documentApi.download] id no está definido");
      return null;
    }
    // Return relative path - apiClient will handle baseURL
    return `/work-documents/${id}/download`;
  },
};
