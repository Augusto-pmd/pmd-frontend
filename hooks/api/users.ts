import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";

export function useUsers() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && organizationId ? "users" : null,
    () => {
      if (!organizationId || !organizationId.trim()) {
        console.warn("❗ [useUsers] organizationId no está definido");
        throw new Error("No hay organización seleccionada");
      }
      const url = safeApiUrlWithParams("/", organizationId, "users");
      if (!url) {
        throw new Error("URL de API inválida");
      }
      return apiClient.get(url);
    }
  );

  return {
    users: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useUser(id: string | null) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!id) {
    console.warn("❗ [useUser] id no está definido");
    return { user: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useUser] organizationId no está definido");
    return { user: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const userUrl = safeApiUrlWithParams("/", organizationId, "users", id);
  
  const { data, error, isLoading, mutate } = useSWR(
    token && userUrl ? userUrl : null,
    () => {
      if (!userUrl) {
        throw new Error("URL de usuario inválida");
      }
      return apiClient.get(userUrl);
    }
  );

  return {
    user: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const userApi = {
  create: (data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [userApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "users");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [userApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [userApi.update] id no está definido");
      throw new Error("ID de usuario no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "users", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [userApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [userApi.delete] id no está definido");
      throw new Error("ID de usuario no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "users", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

