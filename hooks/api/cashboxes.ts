import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Cashbox, CashMovement, CreateCashboxData, UpdateCashboxData, CreateCashMovementData, UpdateCashMovementData } from "@/lib/types/cashbox";

export function useCashboxes() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "cashboxes" : null,
    () => {
      return apiClient.get("/cashboxes");
    }
  );

  return {
    cashboxes: (data?.data || data || []) as Cashbox[],
    error,
    isLoading,
    mutate,
  };
}

export function useCashbox(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useCashbox] id no está definido");
    }
    return { cashbox: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `cashboxes/${id}` : null,
    () => {
      return apiClient.get(`/cashboxes/${id}`);
    }
  );

  return {
    cashbox: (data?.data || data) as Cashbox | null,
    error,
    isLoading,
    mutate,
  };
}

export const cashboxApi = {
  create: (data: CreateCashboxData) => {
    return apiClient.post("/cashboxes", data);
  },
  update: (id: string, data: UpdateCashboxData) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxApi.update] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }
    return apiClient.patch(`/cashboxes/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxApi.delete] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }
    return apiClient.delete(`/cashboxes/${id}`);
  },
};

export function useCashMovements(cashboxId?: string) {
  const { token } = useAuthStore();
  
  let endpoint: string;
  if (cashboxId && cashboxId.trim()) {
    endpoint = `/cash-movements?cashboxId=${encodeURIComponent(cashboxId)}`;
  } else {
    endpoint = "/cash-movements";
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && endpoint ? endpoint : null,
    () => {
      return apiClient.get(endpoint);
    }
  );

  return {
    movements: (data?.data || data || []) as CashMovement[],
    error,
    isLoading,
    mutate,
  };
}

export function useCashMovement(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useCashMovement] id no está definido");
    }
    return { movement: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `cash-movements/${id}` : null,
    () => {
      return apiClient.get(`/cash-movements/${id}`);
    }
  );

  return {
    movement: (data?.data || data) as CashMovement | null,
    error,
    isLoading,
    mutate,
  };
}

export const cashMovementApi = {
  create: (data: CreateCashMovementData) => {
    return apiClient.post("/cash-movements", data);
  },
  update: (id: string, data: UpdateCashMovementData) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashMovementApi.update] id no está definido");
      }
      throw new Error("ID de movimiento no está definido");
    }
    return apiClient.patch(`/cash-movements/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashMovementApi.delete] id no está definido");
      }
      throw new Error("ID de movimiento no está definido");
    }
    return apiClient.delete(`/cash-movements/${id}`);
  },
};
