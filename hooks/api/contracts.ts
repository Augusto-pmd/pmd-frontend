import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";

export function useContracts() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  const fetcher = () => {
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [useContracts] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    const url = safeApiUrlWithParams("/", organizationId, "contracts");
    if (!url) {
      throw new Error("URL de API inválida");
    }
    return apiClient.get(url);
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token && organizationId ? "contracts" : null,
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
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!id) {
    console.warn("❗ [useContract] id no está definido");
    return { contract: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useContract] organizationId no está definido");
    return { contract: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const contractUrl = safeApiUrlWithParams("/", organizationId, "contracts", id);
  
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
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [contractApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "contracts");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [contractApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [contractApi.update] id no está definido");
      throw new Error("ID de contrato no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "contracts", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [contractApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [contractApi.delete] id no está definido");
      throw new Error("ID de contrato no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "contracts", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};
