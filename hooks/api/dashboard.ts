import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";

export function useDashboardStats() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && organizationId ? "dashboard-stats" : null,
    () => {
      if (!organizationId || !organizationId.trim()) {
        console.warn("❗ [useDashboardStats] organizationId no está definido");
        throw new Error("No hay organización seleccionada");
      }
      const url = safeApiUrlWithParams("/", organizationId, "dashboard", "stats");
      if (!url) {
        throw new Error("URL de API inválida");
      }
      return apiClient.get(url);
    }
  );

  return {
    stats: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}
