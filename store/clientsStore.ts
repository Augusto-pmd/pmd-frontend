import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { buildApiRoute } from "@/lib/safeApi";

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
    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      set({ error: "No hay organización seleccionada", isLoading: false });
      console.warn("❗Error: organizationId undefined en clientsStore");
      return;
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(null, "clients");
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

    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en clientsStore");
      throw new Error("No hay organización seleccionada");
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(null, "clients");
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

    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en clientsStore");
      throw new Error("No hay organización seleccionada");
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(null, "clients", id);
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

    // Regla 1: Nunca llamar un endpoint sin organizationId
    const authState = useAuthStore.getState();
    const orgId = authState.user?.organizationId;
    
    if (!orgId) {
      console.warn("❗Error: organizationId undefined en clientsStore");
      throw new Error("No hay organización seleccionada");
    }

    // Regla 2: Actualizar todas las rutas a /api/${orgId}/recurso
    const url = buildApiRoute(null, "clients", id);
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

