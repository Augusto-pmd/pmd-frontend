import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { buildApiRoute } from "@/lib/safeApi";

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
    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en auditStore");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const baseUrl = buildApiRoute(null, "audit");
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
    if (!payload) {
      console.warn("❗ [auditStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en auditStore");
      throw new Error("No hay organización seleccionada");
    }

    // Validar campos obligatorios según DTO
    if (!payload.action || payload.action.trim() === "") {
      throw new Error("La acción es obligatoria");
    }
    if (!payload.module || payload.module.trim() === "") {
      throw new Error("El módulo es obligatorio");
    }
    if (!payload.user || payload.user.trim() === "") {
      throw new Error("El usuario es obligatorio");
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(null, "audit");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      // Construir payload exacto según DTO
      const auditPayload: any = {
        action: payload.action.trim(),
        module: payload.module.trim(),
        user: payload.user.trim(),
        timestamp: payload.timestamp || new Date().toISOString(),
      };

      // Agregar campos opcionales
      if (payload.userId) auditPayload.userId = payload.userId;
      if (payload.userName) auditPayload.userName = payload.userName;
      if (payload.entity) auditPayload.entity = payload.entity;
      if (payload.entityId) auditPayload.entityId = payload.entityId;
      if (payload.details) auditPayload.details = payload.details;
      if (payload.before) auditPayload.before = payload.before;
      if (payload.after) auditPayload.after = payload.after;

      const response = await apiClient.post(url, auditPayload);
      await get().fetchLogs();
      return response;
    } catch (error: any) {
      console.error("🔴 [auditStore] Error al crear entrada de auditoría:", error);
      throw error;
    }
  },

  async clearAuditEntry(id) {
    if (!id) {
      console.warn("❗ [auditStore] id no está definido");
      throw new Error("ID de entrada no está definido");
    }

    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en auditStore");
      throw new Error("No hay organización seleccionada");
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(null, "audit", id);
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
    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en auditStore");
      throw new Error("No hay organización seleccionada");
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(null, "audit");
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

