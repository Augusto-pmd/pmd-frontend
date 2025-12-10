import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { accountingApi } from "@/hooks/api/accounting";

export interface Cashbox {
  id: string;
  opening_date: string; // ISO8601 string
  user_id: string; // UUID
  createdAt?: string;
  closedAt?: string;
  isClosed?: boolean;
  balance?: number;
}

export interface CashMovement {
  id: string;
  cashboxId: string;
  cashbox_id?: string; // Backend field
  type: "ingreso" | "egreso" | "income" | "expense";
  amount: number;
  currency?: "ARS" | "USD"; // Backend field
  category?: string;
  date: string;
  notes?: string;
  description?: string;
  expense_id?: string; // Backend field
  income_id?: string; // Backend field
  supplierId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Nuevos campos
  typeDocument?: "factura" | "comprobante" | null;
  invoiceNumber?: string; // obligatorio si factura
  isIncome?: boolean; // true en refuerzo
  responsible?: string; // responsable del refuerzo
  workId?: string; // obra asociada (para facturas)
  attachmentUrl?: string; // URL del archivo adjunto (comprobantes)
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
    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get("/cashboxes");
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

    // Validar campos obligatorios según backend DTO
    if (!payload.opening_date) {
      throw new Error("La fecha de apertura es obligatoria");
    }
    if (!payload.user_id) {
      throw new Error("El ID de usuario es obligatorio");
    }

    try {
      // Construir payload exacto según DTO del backend
      const cashboxPayload: any = {
        opening_date: payload.opening_date, // ISO8601 string
        user_id: payload.user_id, // UUID
      };

      const response = await apiClient.post("/cashboxes", cashboxPayload);
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

    try {
      await apiClient.put(`/cashboxes/${id}`, payload);
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

    try {
      await apiClient.patch(`/cashboxes/${id}`, { isClosed: true, closedAt: new Date().toISOString() });
      await get().fetchCashboxes();
    } catch (error: any) {
      console.error("🔴 [cashboxStore] Error al cerrar caja:", error);
      throw error;
    }
  },

  async fetchMovements(cashboxId) {
    if (!cashboxId) {
      console.error("🔴 [cashboxStore] cashboxId inválido");
      set({ error: "ID de caja inválido", isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(`/cash-movements?cashboxId=${cashboxId}`);
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

    try {
      // Construir payload exacto según CreateCashMovementDto del backend
      const movementPayload: any = {
        cashbox_id: cashboxId, // required, UUID
        type: payload.type === "ingreso" || payload.type === "income" ? "income" : "expense", // required, CashMovementType enum
        amount: payload.amount, // required, number
        currency: payload.currency || "ARS", // required, "ARS" | "USD"
        date: payload.date ? (typeof payload.date === "string" ? payload.date : new Date(payload.date).toISOString()) : new Date().toISOString(), // required, ISO8601
      };

      // Campos opcionales
      if (payload.description) movementPayload.description = payload.description.trim();
      if (payload.expense_id) movementPayload.expense_id = payload.expense_id;
      if (payload.income_id) movementPayload.income_id = payload.income_id;
      
      const createdMovement = await apiClient.post("/cash-movements", movementPayload);
      
      // Note: Accounting entries should be created separately through the accounting module
      // El backend maneja la relación entre cash movements y accounting entries
      
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

    try {
      // Construir payload exacto según UpdateCashMovementDto del backend
      const movementPayload: any = {};

      // Campos opcionales para actualización
      if (payload.type !== undefined) {
        movementPayload.type = payload.type === "ingreso" || payload.type === "income" ? "income" : "expense";
      }
      if (payload.amount !== undefined) movementPayload.amount = payload.amount;
      if (payload.currency !== undefined) movementPayload.currency = payload.currency;
      if (payload.date !== undefined) {
        movementPayload.date = typeof payload.date === "string" ? payload.date : new Date(payload.date).toISOString();
      }
      if (payload.description !== undefined) movementPayload.description = payload.description.trim();
      if (payload.expense_id !== undefined) movementPayload.expense_id = payload.expense_id;
      if (payload.income_id !== undefined) movementPayload.income_id = payload.income_id;
      
      await apiClient.put(`/cash-movements/${id}`, movementPayload);
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

    try {
      await apiClient.delete(`/cash-movements/${id}`);
      await get().fetchMovements(cashboxId);
    } catch (error: any) {
      console.error("🔴 [cashboxStore] Error al eliminar movimiento:", error);
      throw error;
    }
  },
}));

