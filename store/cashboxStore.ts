import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { accountingApi } from "@/hooks/api/accounting";

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
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      set({ error: "No hay organización seleccionada", isLoading: false });
      return;
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashboxes");
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
    const organizationId = authState.user?.organizationId;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashboxes");
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
    const organizationId = authState.user?.organizationId;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashboxes", id);
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
    const organizationId = authState.user?.organizationId;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    // Obtener movimientos de la caja antes de cerrar
    const movements = get().movements[id] || [];
    
    // Calcular balance final
    let totalIngresos = 0;
    let totalEgresos = 0;
    let cantidadFacturas = 0;
    let cantidadComprobantes = 0;
    const facturas: CashMovement[] = [];

    movements.forEach((movement) => {
      const type = movement.type === "ingreso" || movement.type === "income" ? "ingreso" : "egreso";
      const amount = movement.amount || 0;

      if (type === "ingreso") {
        totalIngresos += amount;
      } else {
        totalEgresos += amount;
        if (movement.typeDocument === "factura") {
          cantidadFacturas++;
          facturas.push(movement);
        } else if (movement.typeDocument === "comprobante") {
          cantidadComprobantes++;
        }
      }
    });

    const saldoInicial = get().cashboxes.find((c) => c.id === id)?.balance || 0;
    const saldoFinal = saldoInicial + totalIngresos - totalEgresos;
    const diferencia = saldoFinal;

    const url = safeApiUrlWithParams("/", organizationId, "cashboxes", id);
    if (!url) {
      throw new Error("URL de cierre inválida");
    }

    try {
      // Enviar resumen completo al backend
      const closePayload = {
        isClosed: true,
        closedAt: new Date().toISOString(),
        finalBalance: saldoFinal,
        summary: {
          totalIngresos,
          totalEgresos,
          cantidadFacturas,
          cantidadComprobantes,
          saldoInicial,
          saldoFinal,
          diferencia,
          facturas: facturas.map((f) => ({
            id: f.id,
            invoiceNumber: f.invoiceNumber,
            amount: f.amount,
            supplierId: f.supplierId,
            workId: f.workId,
          })),
        },
      };

      await apiClient.patch(url, closePayload);
      await get().fetchCashboxes();
    } catch (error: any) {
      console.error("🔴 [cashboxStore] Error al cerrar caja:", error);
      throw error;
    }
  },

  async fetchMovements(cashboxId) {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;

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

    const url = safeApiUrlWithParams("/", organizationId, "cashboxes", cashboxId, "movements");
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
    const organizationId = authState.user?.organizationId;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashboxes", cashboxId, "movements");
    if (!url) {
      throw new Error("URL de API inválida");
    }

    try {
      const movementPayload = {
        ...payload,
        type: payload.type === "ingreso" ? "income" : payload.type === "egreso" ? "expense" : payload.type,
      };
      
      const createdMovement = await apiClient.post(url, movementPayload);
      
      // Si es una factura (egreso con typeDocument = "factura"), generar movimiento contable automáticamente
      if (
        (payload.type === "egreso" || payload.type === "expense") &&
        payload.typeDocument === "factura" &&
        payload.invoiceNumber &&
        payload.workId &&
        payload.supplierId
      ) {
        try {
          const movementId = createdMovement?.id || createdMovement?.data?.id || createdMovement?.data?.[0]?.id;
          
          // Construir payload exacto para contabilidad según DTO
          const accountingPayload = {
            type: "expense",
            amount: payload.amount,
            date: payload.date || new Date().toISOString().split("T")[0],
            workId: payload.workId,
            supplierId: payload.supplierId,
            invoiceNumber: payload.invoiceNumber,
            category: payload.category || "Gastos de caja",
            notes: `Factura ${payload.invoiceNumber} - ${payload.notes || payload.description || ""}`,
            description: `Factura ${payload.invoiceNumber} - ${payload.notes || payload.description || ""}`,
            source: "cashbox",
            cashboxMovementId: movementId,
          };
          
          await accountingApi.createTransaction(accountingPayload);
          console.log("✅ [cashboxStore] Movimiento contable generado automáticamente para factura:", payload.invoiceNumber);
        } catch (accountingError: any) {
          console.error("⚠️ [cashboxStore] Error al generar movimiento contable:", accountingError);
          // No fallar el movimiento de caja si falla la contabilidad, pero loguear el error
          console.warn("⚠️ [cashboxStore] El movimiento de caja se guardó, pero no se pudo generar el movimiento contable");
        }
      }
      
      // Si es un refuerzo (ingreso), NO generar contabilidad
      // Si es un comprobante, NO generar contabilidad
      
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
    const organizationId = authState.user?.organizationId;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashboxes", cashboxId, "movements", id);
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
    const organizationId = authState.user?.organizationId;

    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxStore] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }

    const url = safeApiUrlWithParams("/", organizationId, "cashboxes", cashboxId, "movements", id);
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

