import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_ALERTS } from "@/lib/useSimulation";

export interface Alert {
  id: string;
  type: "seguro" | "documentacion" | "obra" | "contable" | "general";
  personId?: string;
  workId?: string;
  message: string;
  severity: "alta" | "media" | "baja";
  date: string;
  title?: string;
  read: boolean;
  createdAt?: string;
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
    // Modo simulación: usar datos dummy
    if (SIMULATION_MODE) {
      set({ alerts: SIMULATED_ALERTS as Alert[], isLoading: false, error: null });
      return;
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [alertsStore] organizationId vacío. Cancelando fetch.");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "alerts");
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
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [alertsStore] organizationId vacío. Cancelando markAsRead.");
      throw new Error("No hay organización seleccionada");
    }

    if (!id) {
      throw new Error("ID de alerta no está definido");
    }

    // En modo simulación, solo actualizar el estado local
    if (SIMULATION_MODE) {
      set((state) => ({
        alerts: state.alerts.map((alert) =>
          alert.id === id ? { ...alert, read: true } : alert
        ),
      }));
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "alerts", id, "read");
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
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [alertsStore] organizationId vacío. Cancelando creación.");
      throw new Error("No hay organización seleccionada");
    }

    // En modo simulación, solo actualizar el estado local
    if (SIMULATION_MODE) {
      const newAlert: Alert = {
        id: `al-${Date.now()}`,
        type: payload.type || "general",
        message: payload.message || "",
        severity: payload.severity || "media",
        date: payload.date || new Date().toISOString().split("T")[0],
        read: false,
        personId: payload.personId,
        workId: payload.workId,
        title: payload.title,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        alerts: [newAlert, ...state.alerts],
      }));
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "alerts");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      await apiClient.post(url, payload);
      await get().fetchAlerts();
    } catch (error: any) {
      console.error("🔴 [alertsStore] Error al crear alerta:", error);
      throw error;
    }
  },

  async updateAlert(id, payload) {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [alertsStore] organizationId vacío. Cancelando actualización.");
      throw new Error("No hay organización seleccionada");
    }

    if (!id) {
      throw new Error("ID de alerta no está definido");
    }

    // En modo simulación, solo actualizar el estado local
    if (SIMULATION_MODE) {
      set((state) => ({
        alerts: state.alerts.map((alert) =>
          alert.id === id ? { ...alert, ...payload } : alert
        ),
      }));
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "alerts", id);
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
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [alertsStore] organizationId vacío. Cancelando eliminación.");
      throw new Error("No hay organización seleccionada");
    }

    if (!id) {
      throw new Error("ID de alerta no está definido");
    }

    // En modo simulación, solo actualizar el estado local
    if (SIMULATION_MODE) {
      set((state) => ({
        alerts: state.alerts.filter((alert) => alert.id !== id),
      }));
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "alerts", id);
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
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [alertsStore] organizationId vacío. Cancelando markAllAsRead.");
      throw new Error("No hay organización seleccionada");
    }

    // En modo simulación, solo actualizar el estado local
    if (SIMULATION_MODE) {
      set((state) => ({
        alerts: state.alerts.map((alert) => ({ ...alert, read: true })),
      }));
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "alerts", "read-all");
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

