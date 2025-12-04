import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";

export function useWorks() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  const fetcher = () => {
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [useWorks] organizationId no está definido");
      return Promise.resolve({ data: [] });
    }
    const url = safeApiUrlWithParams("/", organizationId, "works");
    if (!url) {
      throw new Error("URL de API inválida");
    }
    return apiClient.get(url);
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token && organizationId ? "works" : null,
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
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!id) {
    console.warn("❗ [useWork] id no está definido");
    return { work: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useWork] organizationId no está definido, permitiendo carga de organización...");
    // No bloquear, permitir que se intente cargar
  }
  
  // Construir URL de forma segura
  const workUrl = safeApiUrlWithParams("/", organizationId, "works", id);
  
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
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [workApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "works");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [workApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [workApi.update] id no está definido");
      throw new Error("ID de obra no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "works", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [workApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [workApi.delete] id no está definido");
      throw new Error("ID de obra no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "works", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

