import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";

const API_BASE = safeApiUrl("/roles");

export function useRoles() {
  const { token } = useAuthStore();
  
  if (!API_BASE) {
    console.error("🔴 [useRoles] API_BASE es inválido");
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
    roles: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useRole(id: string | null) {
  const { token } = useAuthStore();
  
  const roleUrl = id && API_BASE ? safeApiUrlWithParams("/roles", id) : null;
  
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
    if (!API_BASE) throw new Error("API_BASE no está definido");
    return apiClient.post(API_BASE, data);
  },
  update: (id: string, data: any) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/roles", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/roles", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

