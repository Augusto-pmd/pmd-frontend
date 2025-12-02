import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_CASHBOXES, SIMULATED_CASH_MOVEMENTS } from "@/lib/useSimulation";

export interface Cashbox {
  id: string;
  name: string;
  workId?: string;
  createdAt: string;
  closedAt?: string;
  isClosed: boolean;
  balance?: number;
  description?: string;
  notes?: string;
}

export interface CashMovement {
  id: string;
  cashboxId: string;
  type: "ingreso" | "egreso" | "income" | "expense";
  amount: number;
  category?: string;
  date: string;
  notes?: string;
  description?: string;
  supplierId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CashboxState {
  cashboxes: Cashbox[];
  movements: Record<string, CashMovement[]>; // cashboxId -> movements[]
  isLoading: boolean;
  error: string | null;

  fetchCashboxes: () => Promise<void>;
  createCashbox: (payload: Partial<Cashbox>) => Promise<void>;
  updateCashbox: (id: string, payload: Partial<Cashbox>) => Promise<void>;
  closeCashbox: (id: string) => Promise<void>;
  fetchMovements: (cashboxId: string) => Promise<void>;
  createMovement: (cashboxId: string, payload: Partial<CashMovement>) => Promise<void>;
  updateMovement: (cashboxId: string, id: string, payload: Partial<CashMovement>) => Promise<void>;
  deleteMovement: (cashboxId: string, id: string) => Promise<void>;
}

export const useCashboxStore = create<CashboxState>((set, get) => ({
  cashboxes: [],
  movements: {},
  isLoading: false,
  error: null,

  async fetchCashboxes() {
    // Modo simulación: usar datos dummy
    if (SIMULATION_MODE) {
      set({ cashboxes: SIMULATED_CASHBOXES, isLoading: false, error: null });
      return;
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashbox");
    if (!url) {
      console.error("🔴 [cashboxStore] URL inválida");
      set({ error: "URL de API inválida", isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(url);
      set({ cashboxes: data?.data || data || [], isLoading: false });
    } catch (error: any) {
      console.error("🔴 [cashboxStore] Error al obtener cajas:", error);
      set({ error: error.message || "Error al cargar cajas", isLoading: false });
    }
  },

  async createCashbox(payload) {
    if (!payload) {
      console.warn("❗ [cashboxStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashbox");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      const response = await apiClient.post(url, payload);
      await get().fetchCashboxes();
      return response;
    } catch (error: any) {
      console.error("🔴 [cashboxStore] Error al crear caja:", error);
      throw error;
    }
  },

  async updateCashbox(id, payload) {
    if (!id) {
      console.warn("❗ [cashboxStore] id no está definido");
      throw new Error("ID de caja no está definido");
    }

    if (!payload) {
      console.warn("❗ [cashboxStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashbox", id);
    if (!url) {
      throw new Error("URL de actualización inválida");
    }

    try {
      await apiClient.put(url, payload);
      await get().fetchCashboxes();
    } catch (error: any) {
      console.error("🔴 [cashboxStore] Error al actualizar caja:", error);
      throw error;
    }
  },

  async closeCashbox(id) {
    if (!id) {
      console.warn("❗ [cashboxStore] id no está definido");
      throw new Error("ID de caja no está definido");
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashbox", id);
    if (!url) {
      throw new Error("URL de cierre inválida");
    }

    try {
      await apiClient.patch(url, { isClosed: true, closedAt: new Date().toISOString() });
      await get().fetchCashboxes();
    } catch (error: any) {
      console.error("🔴 [cashboxStore] Error al cerrar caja:", error);
      throw error;
    }
  },

  async fetchMovements(cashboxId) {
    // Modo simulación: usar datos dummy
    if (SIMULATION_MODE) {
      const movements = SIMULATED_CASH_MOVEMENTS[cashboxId] || [];
      set((state) => ({
        movements: { ...state.movements, [cashboxId]: movements },
        isLoading: false,
        error: null,
      }));
      return;
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    if (!cashboxId) {
      console.error("🔴 [cashboxStore] cashboxId inválido");
      set({ error: "ID de caja inválido", isLoading: false });
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashbox", cashboxId, "movements");
    if (!url) {
      console.error("🔴 [cashboxStore] URL inválida");
      set({ error: "URL de API inválida", isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(url);
      const movements = data?.data || data || [];
      
      set((state) => ({
        movements: { ...state.movements, [cashboxId]: movements },
        isLoading: false,
      }));
    } catch (error: any) {
      console.error("🔴 [cashboxStore] Error al obtener movimientos:", error);
      set({ error: error.message || "Error al cargar movimientos", isLoading: false });
    }
  },

  async createMovement(cashboxId, payload) {
    if (!cashboxId) {
      console.warn("❗ [cashboxStore] cashboxId no está definido");
      throw new Error("ID de caja no está definido");
    }

    if (!payload) {
      console.warn("❗ [cashboxStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashbox", cashboxId, "movements");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      const movementPayload = {
        ...payload,
        type: payload.type === "ingreso" ? "income" : payload.type === "egreso" ? "expense" : payload.type,
      };
      
      await apiClient.post(url, movementPayload);
      await get().fetchMovements(cashboxId);
    } catch (error: any) {
      console.error("🔴 [cashboxStore] Error al crear movimiento:", error);
      throw error;
    }
  },

  async updateMovement(cashboxId, id, payload) {
    if (!cashboxId) {
      console.warn("❗ [cashboxStore] cashboxId no está definido");
      throw new Error("ID de caja no está definido");
    }

    if (!id) {
      console.warn("❗ [cashboxStore] id no está definido");
      throw new Error("ID de movimiento no está definido");
    }

    if (!payload) {
      console.warn("❗ [cashboxStore] payload no está definido");
      throw new Error("Payload no está definido");
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashbox", cashboxId, "movements", id);
    if (!url) {
      throw new Error("URL de actualización inválida");
    }

    try {
      const movementPayload = {
        ...payload,
        type: payload.type === "ingreso" ? "income" : payload.type === "egreso" ? "expense" : payload.type,
      };
      
      await apiClient.put(url, movementPayload);
      await get().fetchMovements(cashboxId);
    } catch (error: any) {
      console.error("🔴 [cashboxStore] Error al actualizar movimiento:", error);
      throw error;
    }
  },

  async deleteMovement(cashboxId, id) {
    if (!cashboxId) {
      console.warn("❗ [cashboxStore] cashboxId no está definido");
      throw new Error("ID de caja no está definido");
    }

    if (!id) {
      console.warn("❗ [cashboxStore] id no está definido");
      throw new Error("ID de movimiento no está definido");
    }

    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashbox", cashboxId, "movements", id);
    if (!url) {
      throw new Error("URL de eliminación inválida");
    }

    try {
      await apiClient.delete(url);
      await get().fetchMovements(cashboxId);
    } catch (error: any) {
      console.error("🔴 [cashboxStore] Error al eliminar movimiento:", error);
      throw error;
    }
  },
}));

