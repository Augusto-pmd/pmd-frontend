import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";

const API_BASE = safeApiUrl("/users");

export function useUsers() {
  const { token } = useAuthStore();
  
  if (!API_BASE) {
    console.error("🔴 [useUsers] API_BASE es inválido");
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && API_BASE ? API_BASE : null,
    () => {
      if (!API_BASE) {
        throw new Error("API_BASE no está definido correctamente");
      }
      return apiClient.get(API_BASE);
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
  
  const userUrl = id && API_BASE ? safeApiUrlWithParams("/users", id) : null;
  
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
    if (!API_BASE) throw new Error("API_BASE no está definido");
    return apiClient.post(API_BASE, data);
  },
  update: (id: string, data: any) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/users", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/users", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

