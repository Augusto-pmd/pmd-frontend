import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_WORKS } from "@/lib/useSimulation";

export function useWorks() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  // Si está en modo simulación, usar un fetcher que retorna datos dummy
  const fetcher = SIMULATION_MODE
    ? () => Promise.resolve({ data: SIMULATED_WORKS })
    : () => {
        if (!organizationId || !organizationId.trim()) {
          console.warn("❗ [useWorks] organizationId no está definido");
          throw new Error("No hay organización seleccionada");
        }
        const url = safeApiUrlWithParams("/", organizationId, "works");
        if (!url) {
          throw new Error("URL de API inválida");
        }
        return apiClient.get(url);
      };
  
  const { data, error, isLoading, mutate } = useSWR(
    SIMULATION_MODE || (token && organizationId) ? "works" : null,
    fetcher
  );

  return {
    works: data?.data || data || [],
    error,
    isLoading: SIMULATION_MODE ? false : isLoading,
    mutate,
  };
}

export function useWork(id: string | null) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  if (!id) {
    console.warn("❗ [useWork] id no está definido");
    return { work: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useWork] organizationId no está definido");
    return { work: null, error: null, isLoading: false, mutate: async () => {} };
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
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
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
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
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
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
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

