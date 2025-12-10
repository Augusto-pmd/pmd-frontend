import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useContracts() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/contracts");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "contracts" : null,
    fetcher
  );

  return {
    contracts: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useContract(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    console.warn("❗ [useContract] id no está definido");
    return { contract: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `contracts/${id}` : null,
    () => {
      return apiClient.get(`/contracts/${id}`);
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
    return apiClient.post("/contracts", data);
  },
  update: (id: string, data: any) => {
    if (!id) {
      console.warn("❗ [contractApi.update] id no está definido");
      throw new Error("ID de contrato no está definido");
    }
    return apiClient.put(`/contracts/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      console.warn("❗ [contractApi.delete] id no está definido");
      throw new Error("ID de contrato no está definido");
    }
    return apiClient.delete(`/contracts/${id}`);
  },
};
