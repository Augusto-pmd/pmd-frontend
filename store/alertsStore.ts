import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { buildApiRoute } from "@/lib/safeApi";

export interface Alert {
  id: string;
  type: "seguro" | "documentacion" | "obra" | "contable" | "general" | "rrhh";
  personId?: string;
  workId?: string;
  documentId?: string;
  supplierId?: string;
  message: string;
  severity: "alta" | "media" | "baja";
  date: string;
  title?: string;
  read: boolean;
  createdAt?: string;
  notes?: string;
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
    // Backend deriva organizationId del JWT token
    const url = buildApiRoute(null, "alerts");
    if (!url) {
      console.error("🔴 [alertsStore] URL inválida");
      set({ error: "URL de API inválida", isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(url);
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

    // Backend deriva organizationId del JWT token
    const url = buildApiRoute(null, "alerts", id, "read");
    if (!url) {
      throw new Error("URL de markAsRead inválida");
    }

    try {
      await apiClient.patch(url, {});
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

    // Validar campos obligatorios
    if (!payload.message || payload.message.trim() === "") {
      throw new Error("El mensaje de la alerta es obligatorio");
    }
    if (!payload.type || payload.type.trim() === "") {
      throw new Error("El tipo de alerta es obligatorio");
    }
    if (!payload.severity || !["alta", "media", "baja"].includes(payload.severity)) {
      throw new Error("La severidad debe ser: alta, media o baja");
    }
    if (!payload.date || payload.date.trim() === "") {
      throw new Error("La fecha es obligatoria");
    }

    // Backend deriva organizationId del JWT token
    const url = buildApiRoute(null, "alerts");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      // Construir payload exacto según DTO
      const alertPayload: any = {
        message: payload.message.trim(),
        type: payload.type,
        severity: payload.severity,
        date: payload.date,
        read: false,
      };

      // Agregar campos opcionales
      if (payload.title) alertPayload.title = payload.title.trim();
      if (payload.workId) alertPayload.workId = payload.workId;
      if (payload.personId) alertPayload.personId = payload.personId;
      if (payload.documentId) alertPayload.documentId = payload.documentId;
      if (payload.supplierId) alertPayload.supplierId = payload.supplierId;
      if (payload.notes) alertPayload.notes = payload.notes.trim();

      const response = await apiClient.post(url, alertPayload);
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

    // Backend deriva organizationId del JWT token
    const url = buildApiRoute(null, "alerts", id);
    if (!url) {
      throw new Error("URL de actualización inválida");
    }

    try {
      await apiClient.put(url, payload);
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

    // Backend deriva organizationId del JWT token
    const url = buildApiRoute(null, "alerts", id);
    if (!url) {
      throw new Error("URL de eliminación inválida");
    }

    try {
      await apiClient.delete(url);
      await get().fetchAlerts();
    } catch (error: any) {
      console.error("🔴 [alertsStore] Error al eliminar alerta:", error);
      throw error;
    }
  },

  async markAllAsRead() {
    // Backend deriva organizationId del JWT token
    const url = buildApiRoute(null, "alerts", "read-all");
    if (!url) {
      throw new Error("URL de markAllAsRead inválida");
    }

    try {
      await apiClient.patch(url, {});
      await get().fetchAlerts();
    } catch (error: any) {
      console.error("🔴 [alertsStore] Error al marcar todas las alertas como leídas:", error);
      throw error;
    }
  },
}));

