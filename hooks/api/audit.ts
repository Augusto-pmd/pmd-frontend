import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_AUDIT_LOGS } from "@/lib/useSimulation";

export function useAuditLogs(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  // Si está en modo simulación, usar un fetcher que retorna datos dummy
  const fetcher = SIMULATION_MODE
    ? () => {
        let filteredLogs = [...SIMULATED_AUDIT_LOGS];
        
        // Aplicar filtros de fecha si existen
        if (params?.startDate) {
          filteredLogs = filteredLogs.filter(
            (log) => log.timestamp >= params.startDate!
          );
        }
        if (params?.endDate) {
          filteredLogs = filteredLogs.filter(
            (log) => log.timestamp <= params.endDate!
          );
        }
        
        // Ordenar por timestamp descendente (más recientes primero)
        filteredLogs.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        return Promise.resolve({ data: filteredLogs });
      }
    : () => {
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
    SIMULATION_MODE || (token && organizationId) ? `audit${queryString}` : null,
    fetcher
  );

  return {
    logs: data?.data || data || [],
    error,
    isLoading: SIMULATION_MODE ? false : isLoading,
    mutate,
  };
}

export function useAuditLog(id: string | null) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
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
