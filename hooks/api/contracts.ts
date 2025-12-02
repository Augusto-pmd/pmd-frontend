import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_CONTRACTS } from "@/lib/useSimulation";

const API_BASE = safeApiUrl("/contracts");

export function useContracts() {
  const { token } = useAuthStore();
  
  // Si está en modo simulación, usar un fetcher que retorna datos dummy
  const fetcher = SIMULATION_MODE
    ? () => Promise.resolve({ data: SIMULATED_CONTRACTS })
    : () => {
        if (!API_BASE) {
          throw new Error("API_BASE no está definido correctamente");
        }
        return apiClient.get(API_BASE);
      };
  
  if (!API_BASE && !SIMULATION_MODE) {
    console.error("🔴 [useContracts] API_BASE es inválido");
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    SIMULATION_MODE || (token && API_BASE) ? "contracts" : null,
    fetcher
  );

  return {
    contracts: data?.data || data || [],
    error,
    isLoading: SIMULATION_MODE ? false : isLoading,
    mutate,
  };
}

export function useContract(id: string | null) {
  const { token } = useAuthStore();
  
  const contractUrl = id && API_BASE ? safeApiUrlWithParams("/contracts", id) : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && contractUrl ? contractUrl : null,
    () => {
      if (!contractUrl) {
        throw new Error("URL de contrato inválida");
      }
      return apiClient.get(contractUrl);
    }
  );

  return {
    contract: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const contractApi = {
  create: (data: any) => {
    if (!API_BASE) throw new Error("API_BASE no está definido");
    return apiClient.post(API_BASE, data);
  },
  update: (id: string, data: any) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/contracts", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/contracts", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

