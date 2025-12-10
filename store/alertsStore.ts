import { create } from "zustand";
import { apiClient } from "@/lib/api";

export interface Alert {
  id: string;
  category: string; // Debe coincidir con enum del backend
  workId?: string;
  supplierId?: string;
  title: string; // Máximo 255 caracteres
  description?: string;
  severity: "info" | "warning" | "critical";
  read: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AlertsState {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;

  fetchAlerts: () => Promise<void>;
  createAlert: (payload: Partial<Alert>) => Promise<void>;
  updateAlert: (id: string, payload: Partial<Alert>) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  isLoading: false,
  error: null,

  async fetchAlerts() {
    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get("/alerts");
      set({ alerts: data?.data || data || [], isLoading: false });
    } catch (error: any) {
      console.error("🔴 [alertsStore] Error al obtener alertas:", error);
      set({ error: error.message || "Error al cargar alertas", isLoading: false });
    }
  },

  async markAsRead(id) {
    if (!id) {
      console.warn("❗ [alertsStore] id no está definido");
      throw new Error("ID de alerta no está definido");
    }

    try {
      await apiClient.patch(`/alerts/${id}/read`, {});
      await get().fetchAlerts();
    } catch (error: any) {
      console.error("🔴 [alertsStore] Error al marcar alerta como leída:", error);
      throw error;
    }
  },

  async createAlert(payload) {
    if (!payload) {
      console.warn("❗ [alertsStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    // Validar campos obligatorios según backend DTO
    if (!payload.title || payload.title.trim() === "") {
      throw new Error("El título es obligatorio");
    }
    if (payload.title.length > 255) {
      throw new Error("El título no puede exceder 255 caracteres");
    }
    if (!payload.severity || !["info", "warning", "critical"].includes(payload.severity)) {
      throw new Error("La severidad debe ser: info, warning o critical");
    }
    if (!payload.category) {
      throw new Error("La categoría es obligatoria");
    }

    try {
      // Construir payload exacto según DTO del backend
      const alertPayload: any = {
        title: payload.title.trim(),
        severity: payload.severity,
        category: payload.category,
      };

      // Agregar campos opcionales
      if (payload.description) alertPayload.description = payload.description.trim();
      if (payload.workId) alertPayload.workId = payload.workId;
      if (payload.supplierId) alertPayload.supplierId = payload.supplierId;

      const response = await apiClient.post("/alerts", alertPayload);
      await get().fetchAlerts();
      return response;
    } catch (error: any) {
      console.error("🔴 [alertsStore] Error al crear alerta:", error);
      throw error;
    }
  },

  async updateAlert(id, payload) {
    if (!id) {
      console.warn("❗ [alertsStore] id no está definido");
      throw new Error("ID de alerta no está definido");
    }

    if (!payload) {
      console.warn("❗ [alertsStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    try {
      await apiClient.put(`/alerts/${id}`, payload);
      await get().fetchAlerts();
    } catch (error: any) {
      console.error("🔴 [alertsStore] Error al actualizar alerta:", error);
      throw error;
    }
  },

  async deleteAlert(id) {
    if (!id) {
      console.warn("❗ [alertsStore] id no está definido");
      throw new Error("ID de alerta no está definido");
    }

    try {
      await apiClient.delete(`/alerts/${id}`);
      await get().fetchAlerts();
    } catch (error: any) {
      console.error("🔴 [alertsStore] Error al eliminar alerta:", error);
      throw error;
    }
  },

  async markAllAsRead() {
    try {
      // Marcar todas como leídas individualmente o usar endpoint si existe
      const unreadAlerts = get().alerts.filter(a => !a.read);
      await Promise.all(unreadAlerts.map(alert => apiClient.patch(`/alerts/${alert.id}/read`, {})));
      await get().fetchAlerts();
    } catch (error: any) {
      console.error("🔴 [alertsStore] Error al marcar todas las alertas como leídas:", error);
      throw error;
    }
  },
}));

