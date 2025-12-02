import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_ALERTS } from "@/lib/useSimulation";

export interface Alert {
  id: string;
  type: string;
  personId?: string;
  workId?: string;
  message: string;
  severity?: "alta" | "media" | "baja";
  date: string;
  title?: string;
  read?: boolean;
  createdAt?: string;
}

interface AlertsState {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;

  fetchAlerts: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
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
}));

