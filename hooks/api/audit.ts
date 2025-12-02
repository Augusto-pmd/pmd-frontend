import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_AUDIT_LOGS } from "@/lib/useSimulation";

const API_BASE = safeApiUrl("/audit");

export function useAuditLogs(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  
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
        if (!API_BASE) {
          throw new Error("API_BASE no está definido correctamente");
        }
        const queryString = params
          ? `?${new URLSearchParams(params as any).toString()}`
          : "";
        const auditUrl = `${API_BASE}${queryString}`;
        return apiClient.get(auditUrl);
      };
  
  if (!API_BASE && !SIMULATION_MODE) {
    console.error("🔴 [useAuditLogs] API_BASE es inválido");
  }
  
  const queryString = params
    ? `?${new URLSearchParams(params as any).toString()}`
    : "";
  
  const auditUrl = API_BASE ? `${API_BASE}${queryString}` : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    SIMULATION_MODE || (token && auditUrl) ? `audit${queryString}` : null,
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

