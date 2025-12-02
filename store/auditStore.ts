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
  before?: any;
  after?: any;
}

interface AuditState {
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;

  fetchLogs: (params?: { startDate?: string; endDate?: string; module?: string; user?: string }) => Promise<void>;
  createAuditEntry: (payload: Partial<AuditLog>) => Promise<void>;
  clearAuditEntry: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
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
      
      // Filtro por módulo
      if (params?.module) {
        filteredLogs = filteredLogs.filter(
          (log) => log.module === params.module
        );
      }
      
      // Filtro por usuario
      if (params?.user) {
        filteredLogs = filteredLogs.filter(
          (log) => log.user === params.user || log.userId === params.user
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
    if (params?.module) queryParams.append("module", params.module);
    if (params?.user) queryParams.append("user", params.user);
    
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

  async createAuditEntry(payload) {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [auditStore] organizationId vacío. Cancelando creación.");
      throw new Error("No hay organización seleccionada");
    }

    // En modo simulación, solo actualizar el estado local
    if (SIMULATION_MODE) {
      const newEntry: AuditLog = {
        id: `aud-${Date.now()}`,
        user: payload.user || "system",
        action: payload.action || "",
        module: payload.module || "General",
        timestamp: payload.timestamp || new Date().toISOString(),
        before: payload.before,
        after: payload.after,
        details: payload.details,
        entity: payload.entity,
        entityId: payload.entityId,
        userName: payload.userName,
        userId: payload.userId,
      };
      set((state) => ({
        logs: [newEntry, ...state.logs],
      }));
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "audit");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      await apiClient.post(url, payload);
      await get().fetchLogs();
    } catch (error: any) {
      console.error("🔴 [auditStore] Error al crear entrada de auditoría:", error);
      throw error;
    }
  },

  async clearAuditEntry(id) {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [auditStore] organizationId vacío. Cancelando eliminación.");
      throw new Error("No hay organización seleccionada");
    }

    if (!id) {
      throw new Error("ID de entrada no está definido");
    }

    // En modo simulación, solo actualizar el estado local
    if (SIMULATION_MODE) {
      set((state) => ({
        logs: state.logs.filter((log) => log.id !== id),
      }));
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "audit", id);
    if (!url) {
      throw new Error("URL de eliminación inválida");
    }

    try {
      await apiClient.delete(url);
      await get().fetchLogs();
    } catch (error: any) {
      console.error("🔴 [auditStore] Error al eliminar entrada de auditoría:", error);
      throw error;
    }
  },

  async clearAll() {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [auditStore] organizationId vacío. Cancelando limpieza.");
      throw new Error("No hay organización seleccionada");
    }

    // En modo simulación, solo actualizar el estado local
    if (SIMULATION_MODE) {
      set({ logs: [] });
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "audit");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      await apiClient.delete(url);
      await get().fetchLogs();
    } catch (error: any) {
      console.error("🔴 [auditStore] Error al limpiar todos los registros:", error);
      throw error;
    }
  },
}));

