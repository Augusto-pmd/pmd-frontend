import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_ALERTS } from "@/lib/useSimulation";

export function useAlerts() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  // Si está en modo simulación, usar un fetcher que retorna datos dummy
  const fetcher = SIMULATION_MODE
    ? () => Promise.resolve({ data: SIMULATED_ALERTS })
    : () => {
        if (!organizationId || !organizationId.trim()) {
          console.warn("❗ [useAlerts] organizationId no está definido");
          throw new Error("No hay organización seleccionada");
        }
        const url = safeApiUrlWithParams("/", organizationId, "alerts");
        if (!url) {
          throw new Error("URL de API inválida");
        }
        return apiClient.get(url);
      };
  
  const { data, error, isLoading, mutate } = useSWR(
    SIMULATION_MODE || (token && organizationId) ? "alerts" : null,
    fetcher
  );

  return {
    alerts: data?.data || data || [],
    error,
    isLoading: SIMULATION_MODE ? false : isLoading,
    mutate,
  };
}

export function useAlert(id: string | null) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  if (!id) {
    console.warn("❗ [useAlert] id no está definido");
    return { alert: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useAlert] organizationId no está definido");
    return { alert: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const alertUrl = safeApiUrlWithParams("/", organizationId, "alerts", id);
  
  const { data, error, isLoading, mutate } = useSWR(
    token && alertUrl ? alertUrl : null,
    () => {
      if (!alertUrl) {
        throw new Error("URL de alerta inválida");
      }
      return apiClient.get(alertUrl);
    }
  );

  return {
    alert: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const alertApi = {
  create: (data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [alertApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "alerts");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [alertApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [alertApi.update] id no está definido");
      throw new Error("ID de alerta no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "alerts", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [alertApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [alertApi.delete] id no está definido");
      throw new Error("ID de alerta no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "alerts", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
  markAsRead: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [alertApi.markAsRead] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [alertApi.markAsRead] id no está definido");
      throw new Error("ID de alerta no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "alerts", id, "read");
    if (!url) throw new Error("URL de markAsRead inválida");
    return apiClient.patch(url, {});
  },
};
