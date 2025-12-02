import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_ALERTS } from "@/lib/useSimulation";

const API_BASE = safeApiUrl("/alerts");

export function useAlerts() {
  const { token } = useAuthStore();
  
  // Si está en modo simulación, usar un fetcher que retorna datos dummy
  const fetcher = SIMULATION_MODE
    ? () => Promise.resolve({ data: SIMULATED_ALERTS })
    : () => {
        if (!API_BASE) {
          throw new Error("API_BASE no está definido correctamente");
        }
        return apiClient.get(API_BASE);
      };
  
  if (!API_BASE && !SIMULATION_MODE) {
    console.error("🔴 [useAlerts] API_BASE es inválido");
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    SIMULATION_MODE || (token && API_BASE) ? "alerts" : null,
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
  
  const alertUrl = id && API_BASE ? safeApiUrlWithParams("/alerts", id) : null;
  
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
    if (!API_BASE) throw new Error("API_BASE no está definido");
    return apiClient.post(API_BASE, data);
  },
  update: (id: string, data: any) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/alerts", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/alerts", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
  markAsRead: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/alerts", id, "read");
    if (!url) throw new Error("URL de markAsRead inválida");
    return apiClient.patch(url, {});
  },
};

