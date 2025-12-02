import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams, isValidApiUrl } from "@/lib/safeApi";

// Construir API_BASE de forma segura
const API_BASE = safeApiUrl("/cashboxes");

export function useCashboxes() {
  const { token } = useAuthStore();
  
  if (!API_BASE) {
    console.error("🔴 [useCashboxes] API_BASE es inválido");
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && API_BASE ? API_BASE : null,
    () => {
      if (!API_BASE) {
        throw new Error("API_BASE no está definido correctamente");
      }
      return apiClient.get(API_BASE);
    }
  );

  return {
    cashboxes: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useCashbox(id: string | null) {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `${API_BASE}/${id}` : null,
    () => apiClient.get(`${API_BASE}/${id}`)
  );

  return {
    cashbox: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const cashboxApi = {
  create: (data: any) => {
    if (!API_BASE) throw new Error("API_BASE no está definido");
    return apiClient.post(API_BASE, data);
  },
  update: (id: string, data: any) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/cashboxes", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/cashboxes", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

const CASH_MOVEMENTS_BASE = safeApiUrl("/cash-movements");

export function useCashMovements(cashboxId?: string) {
  const { token } = useAuthStore();
  
  // Construir endpoint de forma segura
  let endpoint: string | null = null;
  if (CASH_MOVEMENTS_BASE) {
    if (cashboxId && cashboxId.trim()) {
      const baseUrl = CASH_MOVEMENTS_BASE;
      endpoint = `${baseUrl}?cashboxId=${encodeURIComponent(cashboxId)}`;
    } else {
      endpoint = CASH_MOVEMENTS_BASE;
    }
  }
  
  if (endpoint && !isValidApiUrl(endpoint)) {
    console.error("🔴 [useCashMovements] Endpoint inválido:", endpoint);
    endpoint = null;
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && endpoint ? endpoint : null,
    () => {
      if (!endpoint) {
        throw new Error("Endpoint de movimientos inválido");
      }
      return apiClient.get(endpoint);
    }
  );

  return {
    movements: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useCashMovement(id: string | null) {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `${CASH_MOVEMENTS_BASE}/${id}` : null,
    () => apiClient.get(`${CASH_MOVEMENTS_BASE}/${id}`)
  );

  return {
    movement: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const cashMovementApi = {
  create: (data: any) => {
    if (!CASH_MOVEMENTS_BASE) throw new Error("CASH_MOVEMENTS_BASE no está definido");
    return apiClient.post(CASH_MOVEMENTS_BASE, data);
  },
  update: (id: string, data: any) => {
    if (!CASH_MOVEMENTS_BASE || !id) throw new Error("CASH_MOVEMENTS_BASE o id no está definido");
    const url = safeApiUrlWithParams("/cash-movements", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    if (!CASH_MOVEMENTS_BASE || !id) throw new Error("CASH_MOVEMENTS_BASE o id no está definido");
    const url = safeApiUrlWithParams("/cash-movements", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

