import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";

const API_BASE = safeApiUrl("/audit");

export function useAuditLogs(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  
  if (!API_BASE) {
    console.error("🔴 [useAuditLogs] API_BASE es inválido");
  }
  
  const queryString = params
    ? `?${new URLSearchParams(params as any).toString()}`
    : "";
  
  const auditUrl = API_BASE ? `${API_BASE}${queryString}` : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && auditUrl ? auditUrl : null,
    () => {
      if (!auditUrl) {
        throw new Error("URL de auditoría inválida");
      }
      return apiClient.get(auditUrl);
    }
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
  
  const logUrl = id && API_BASE ? safeApiUrlWithParams("/audit", id) : null;
  
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

