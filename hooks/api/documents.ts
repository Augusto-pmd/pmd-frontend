import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";

export function useDocuments(workId?: string) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  const fetcher = async () => {
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [useDocuments] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    try {
      const baseUrl = safeApiUrlWithParams("/", organizationId, "documents");
      if (!baseUrl) {
        throw new Error("URL de API inválida");
      }
      const url = workId ? `${baseUrl}?workId=${workId}` : baseUrl;
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
    token && organizationId ? `documents${workId ? `-${workId}` : ""}` : null,
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
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!id) {
    console.warn("❗ [useDocument] id no está definido");
    return { document: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useDocument] organizationId no está definido");
    return { document: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const documentUrl = safeApiUrlWithParams("/", organizationId, "documents", id);
  
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
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [documentApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "documents");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [documentApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [documentApi.update] id no está definido");
      throw new Error("ID de documento no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "documents", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [documentApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [documentApi.delete] id no está definido");
      throw new Error("ID de documento no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "documents", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
  download: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [documentApi.download] organizationId no está definido");
      return null;
    }
    
    if (!id) {
      console.warn("❗ [documentApi.download] id no está definido");
      return null;
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "documents", id, "download");
    return url || null;
  },
};
