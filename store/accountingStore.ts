import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_ACCOUNTING_ENTRIES } from "@/lib/useSimulation";

export interface AccountingEntry {
  id: string;
  workId?: string;
  obraId?: string;
  supplierId?: string;
  proveedorId?: string;
  date: string;
  fecha?: string;
  amount: number;
  monto?: number;
  type: "ingreso" | "egreso" | "income" | "expense";
  tipo?: "ingreso" | "egreso";
  category?: string;
  categoria?: string;
  notes?: string;
  notas?: string;
  description?: string;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AccountingState {
  entries: AccountingEntry[];
  isLoading: boolean;
  error: string | null;

  fetchEntries: (filters?: {
    workId?: string;
    supplierId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
  }) => Promise<void>;
  createEntry: (payload: Partial<AccountingEntry>) => Promise<void>;
  updateEntry: (id: string, payload: Partial<AccountingEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useAccountingStore = create<AccountingState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  async fetchEntries(filters = {}) {
    // Modo simulación: usar datos dummy
    if (SIMULATION_MODE) {
      let filteredEntries = [...SIMULATED_ACCOUNTING_ENTRIES] as AccountingEntry[];
      
      // Aplicar filtros
      if (filters.workId) {
        filteredEntries = filteredEntries.filter(
          (e) => e.workId === filters.workId || e.obraId === filters.workId
        );
      }
      if (filters.supplierId) {
        filteredEntries = filteredEntries.filter(
          (e) => e.supplierId === filters.supplierId || e.proveedorId === filters.supplierId
        );
      }
      if (filters.type) {
        filteredEntries = filteredEntries.filter(
          (e) => e.type === filters.type || e.tipo === filters.type
        );
      }
      if (filters.category) {
        filteredEntries = filteredEntries.filter(
          (e) => e.category === filters.category || e.categoria === filters.category
        );
      }
      if (filters.startDate) {
        filteredEntries = filteredEntries.filter(
          (e) => {
            const entryDate = e.date || e.fecha;
            return entryDate ? entryDate >= filters.startDate! : false;
          }
        );
      }
      if (filters.endDate) {
        filteredEntries = filteredEntries.filter(
          (e) => {
            const entryDate = e.date || e.fecha;
            return entryDate ? entryDate <= filters.endDate! : false;
          }
        );
      }
      
      set({ entries: filteredEntries, isLoading: false, error: null });
      return;
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [accountingStore] organizationId vacío. Cancelando fetch contable.");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });

      // Construir query string con filtros
      const queryParams = new URLSearchParams();
      if (filters.workId) queryParams.append("workId", filters.workId);
      if (filters.supplierId) queryParams.append("supplierId", filters.supplierId);
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.category) queryParams.append("category", filters.category);

      const queryString = queryParams.toString();
      const baseUrl = safeApiUrlWithParams("/", organizationId, "accounting");
      if (!baseUrl) {
        throw new Error("URL de API inválida");
      }
      const url = queryString ? `${baseUrl}/transactions?${queryString}` : `${baseUrl}/transactions`;

      const data = await apiClient.get(url);
      set({ entries: data?.data || data || [], isLoading: false });
    } catch (error: any) {
      console.error("🔴 [accountingStore] Error al obtener movimientos:", error);
      set({ error: error.message || "Error al cargar movimientos contables", isLoading: false });
    }
  },

  async createEntry(payload) {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [accountingStore] organizationId vacío. Cancelando creación.");
      throw new Error("No hay organización seleccionada");
    }

    const baseUrl = safeApiUrlWithParams("/", organizationId, "accounting");
    if (!baseUrl) {
      throw new Error("URL de API inválida");
    }

    try {
      const url = `${baseUrl}/transactions`;
      await apiClient.post(url, payload);
      await get().fetchEntries();
    } catch (error: any) {
      console.error("🔴 [accountingStore] Error al crear movimiento:", error);
      throw error;
    }
  },

  async updateEntry(id, payload) {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [accountingStore] organizationId vacío. Cancelando actualización.");
      throw new Error("No hay organización seleccionada");
    }

    if (!id) {
      throw new Error("ID de movimiento no está definido");
    }

    const url = safeApiUrlWithParams("/", organizationId, "accounting", "transactions", id);
    if (!url) {
      throw new Error("URL de actualización inválida");
    }

    try {
      await apiClient.put(url, payload);
      await get().fetchEntries();
    } catch (error: any) {
      console.error("🔴 [accountingStore] Error al actualizar movimiento:", error);
      throw error;
    }
  },

  async deleteEntry(id) {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("⚠️ [accountingStore] organizationId vacío. Cancelando eliminación.");
      throw new Error("No hay organización seleccionada");
    }

    if (!id) {
      throw new Error("ID de movimiento no está definido");
    }

    const url = safeApiUrlWithParams("/", organizationId, "accounting", "transactions", id);
    if (!url) {
      throw new Error("URL de eliminación inválida");
    }

    try {
      await apiClient.delete(url);
      await get().fetchEntries();
    } catch (error: any) {
      console.error("🔴 [accountingStore] Error al eliminar movimiento:", error);
      throw error;
    }
  },
}));

