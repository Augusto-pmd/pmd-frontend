import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_AUDIT_LOGS } from "@/lib/useSimulation";

export interface AuditLog {
  id: string;
  user: string;
  userName?: string;
  userId?: string;
  action: string;
  module: string;
  entity?: string;
  entityId?: string;
  details?: string;
  timestamp: string;
}

interface AuditState {
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;

  fetchLogs: (params?: { startDate?: string; endDate?: string }) => Promise<void>;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,

  async fetchLogs(params) {
    // Modo simulación: usar datos dummy
    if (SIMULATION_MODE) {
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
      
      set({ logs: filteredLogs, isLoading: false, error: null });
      return;
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [auditStore] organizationId vacío. Cancelando fetch.");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    const baseUrl = safeApiUrlWithParams("/", organizationId, "audit");
    if (!baseUrl) {
      console.error("🔴 [auditStore] URL inválida");
      set({ error: "URL de API inválida", isLoading: false });
      return;
    }

    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(url);
      set({ logs: data?.data || data || [], isLoading: false });
    } catch (error: any) {
      console.error("🔴 [auditStore] Error al obtener logs de auditoría:", error);
      set({ error: error.message || "Error al cargar logs de auditoría", isLoading: false });
    }
  },
}));

