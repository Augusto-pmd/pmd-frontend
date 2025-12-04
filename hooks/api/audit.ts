import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";

export function useAuditLogs(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  const fetcher = () => {
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [useAuditLogs] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    const baseUrl = safeApiUrlWithParams("/", organizationId, "audit");
    if (!baseUrl) {
      throw new Error("URL de API inválida");
    }
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    const auditUrl = `${baseUrl}${queryString}`;
    return apiClient.get(auditUrl);
  };
  
  const queryString = params
    ? `?${new URLSearchParams(params as any).toString()}`
    : "";

  const { data, error, isLoading, mutate } = useSWR(
    token && organizationId ? `audit${queryString}` : null,
    fetcher
  );

  return {
    logs: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAuditLog(id: string | null) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!id) {
    console.warn("❗ [useAuditLog] id no está definido");
    return { log: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useAuditLog] organizationId no está definido");
    return { log: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const logUrl = safeApiUrlWithParams("/", organizationId, "audit", id);
  
  const { data, error, isLoading, mutate } = useSWR(
    token && logUrl ? logUrl : null,
    () => {
      if (!logUrl) {
        throw new Error("URL de log de auditoría inválida");
      }
      return apiClient.get(logUrl);
    }
  );

  return {
    log: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}
