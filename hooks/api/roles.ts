import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";

export function useRoles() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && organizationId ? "roles" : null,
    () => {
      if (!organizationId || !organizationId.trim()) {
        console.warn("❗ [useRoles] organizationId no está definido");
        throw new Error("No hay organización seleccionada");
      }
      const url = safeApiUrlWithParams("/", organizationId, "roles");
      if (!url) {
        throw new Error("URL de API inválida");
      }
      return apiClient.get(url);
    }
  );

  return {
    roles: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useRole(id: string | null) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!id) {
    console.warn("❗ [useRole] id no está definido");
    return { role: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useRole] organizationId no está definido");
    return { role: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const roleUrl = safeApiUrlWithParams("/", organizationId, "roles", id);
  
  const { data, error, isLoading, mutate } = useSWR(
    token && roleUrl ? roleUrl : null,
    () => {
      if (!roleUrl) {
        throw new Error("URL de rol inválida");
      }
      return apiClient.get(roleUrl);
    }
  );

  return {
    role: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const roleApi = {
  create: (data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [roleApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "roles");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [roleApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [roleApi.update] id no está definido");
      throw new Error("ID de rol no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "roles", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [roleApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [roleApi.delete] id no está definido");
      throw new Error("ID de rol no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "roles", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

