import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";

export function useClients() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  const fetcher = () => {
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [useClients] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    const url = safeApiUrlWithParams("/", organizationId, "clients");
    if (!url) {
      throw new Error("URL de API inválida");
    }
    return apiClient.get(url);
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token && organizationId ? "clients" : null,
    fetcher
  );

  return {
    clients: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useClient(id: string | null) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!id) {
    console.warn("❗ [useClient] id no está definido");
    return { client: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useClient] organizationId no está definido");
    return { client: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const clientUrl = safeApiUrlWithParams("/", organizationId, "clients", id);
  
  const { data, error, isLoading, mutate } = useSWR(
    token && clientUrl ? clientUrl : null,
    () => {
      if (!clientUrl) {
        throw new Error("URL de cliente inválida");
      }
      return apiClient.get(clientUrl);
    }
  );

  return {
    client: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const clientApi = {
  create: (data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [clientApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "clients");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [clientApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [clientApi.update] id no está definido");
      throw new Error("ID de cliente no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "clients", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [clientApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [clientApi.delete] id no está definido");
      throw new Error("ID de cliente no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "clients", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};
