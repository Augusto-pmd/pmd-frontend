import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_SUPPLIERS } from "@/lib/useSimulation";

export function useSuppliers() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  // Si está en modo simulación, usar un fetcher que retorna datos dummy
  const fetcher = SIMULATION_MODE
    ? () => Promise.resolve({ data: SIMULATED_SUPPLIERS })
    : () => {
        if (!organizationId || !organizationId.trim()) {
          console.warn("❗ [useSuppliers] organizationId no está definido");
          throw new Error("No hay organización seleccionada");
        }
        const url = safeApiUrlWithParams("/", organizationId, "suppliers");
        if (!url) {
          throw new Error("URL de API inválida");
        }
        return apiClient.get(url);
      };
  
  const { data, error, isLoading, mutate } = useSWR(
    SIMULATION_MODE || (token && organizationId) ? "suppliers" : null,
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
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  if (!id) {
    console.warn("❗ [useSupplier] id no está definido");
    return { supplier: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useSupplier] organizationId no está definido");
    return { supplier: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const supplierUrl = safeApiUrlWithParams("/", organizationId, "suppliers", id);
  
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
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [supplierApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "suppliers");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [supplierApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [supplierApi.update] id no está definido");
      throw new Error("ID de proveedor no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "suppliers", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [supplierApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [supplierApi.delete] id no está definido");
      throw new Error("ID de proveedor no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "suppliers", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

