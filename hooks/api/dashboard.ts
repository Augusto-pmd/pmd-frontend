import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl } from "@/lib/safeApi";

const API_BASE = safeApiUrl("/dashboard/stats");

export function useDashboardStats() {
  const { token } = useAuthStore();
  
  if (!API_BASE) {
    console.error("🔴 [useDashboardStats] API_BASE es inválido");
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
    stats: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

