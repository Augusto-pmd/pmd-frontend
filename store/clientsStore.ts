import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_CLIENTS } from "@/lib/useSimulation";

export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  projects?: string[];
  notes?: string;
  status?: "activo" | "inactivo";
  createdAt?: string;
  updatedAt?: string;
}

interface ClientsState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;

  fetchClients: () => Promise<void>;
  createClient: (payload: Partial<Client>) => Promise<void>;
  updateClient: (id: string, payload: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  isLoading: false,
  error: null,

  async fetchClients() {
    // Modo simulación: usar datos dummy
    if (SIMULATION_MODE) {
      set({ clients: SIMULATED_CLIENTS as Client[], isLoading: false, error: null });
      return;
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [clientsStore] organizationId no está definido");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "clients");
    if (!url) {
      console.error("🔴 [clientsStore] URL inválida");
      set({ error: "URL de API inválida", isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(url);
      set({ clients: data?.data || data || [], isLoading: false });
    } catch (error: any) {
      console.error("🔴 [clientsStore] Error al obtener clientes:", error);
      set({ error: error.message || "Error al cargar clientes", isLoading: false });
    }
  },

  async createClient(payload) {
    if (!payload) {
      console.warn("❗ [clientsStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [clientsStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "clients");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      await apiClient.post(url, payload);
      await get().fetchClients();
    } catch (error: any) {
      console.error("🔴 [clientsStore] Error al crear cliente:", error);
      throw error;
    }
  },

  async updateClient(id, payload) {
    if (!id) {
      console.warn("❗ [clientsStore] id no está definido");
      throw new Error("ID de cliente no está definido");
    }

    if (!payload) {
      console.warn("❗ [clientsStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [clientsStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "clients", id);
    if (!url) {
      throw new Error("URL de actualización inválida");
    }

    try {
      await apiClient.put(url, payload);
      await get().fetchClients();
    } catch (error: any) {
      console.error("🔴 [clientsStore] Error al actualizar cliente:", error);
      throw error;
    }
  },

  async deleteClient(id) {
    if (!id) {
      console.warn("❗ [clientsStore] id no está definido");
      throw new Error("ID de cliente no está definido");
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [clientsStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "clients", id);
    if (!url) {
      throw new Error("URL de eliminación inválida");
    }

    try {
      await apiClient.delete(url);
      await get().fetchClients();
    } catch (error: any) {
      console.error("🔴 [clientsStore] Error al eliminar cliente:", error);
      throw error;
    }
  },
}));

