import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_SUPPLIERS } from "@/lib/useSimulation";

// Construir API_BASE de forma segura
const API_BASE = safeApiUrl("/suppliers");

export function useSuppliers() {
  const { token } = useAuthStore();
  
  // Si está en modo simulación, usar un fetcher que retorna datos dummy
  const fetcher = SIMULATION_MODE
    ? () => Promise.resolve({ data: SIMULATED_SUPPLIERS })
    : () => {
        if (!API_BASE) {
          throw new Error("API_BASE no está definido correctamente");
        }
        return apiClient.get(API_BASE);
      };
  
  if (!API_BASE && !SIMULATION_MODE) {
    console.error("🔴 [useSuppliers] API_BASE es inválido");
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    SIMULATION_MODE || (token && API_BASE) ? "suppliers" : null,
    fetcher
  );

  return {
    suppliers: data?.data || data || [],
    error,
    isLoading: SIMULATION_MODE ? false : isLoading,
    mutate,
  };
}

export function useSupplier(id: string | null) {
  const { token } = useAuthStore();
  
  const supplierUrl = id && API_BASE ? safeApiUrlWithParams("/suppliers", id) : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && supplierUrl ? supplierUrl : null,
    () => {
      if (!supplierUrl) {
        throw new Error("URL de proveedor inválida");
      }
      return apiClient.get(supplierUrl);
    }
  );

  return {
    supplier: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const supplierApi = {
  create: (data: any) => {
    if (!API_BASE) throw new Error("API_BASE no está definido");
    return apiClient.post(API_BASE, data);
  },
  update: (id: string, data: any) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/suppliers", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/suppliers", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

