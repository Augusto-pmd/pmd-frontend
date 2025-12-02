import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams, isValidApiUrl } from "@/lib/safeApi";

export function useCashboxes() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && organizationId ? "cashboxes" : null,
    () => {
      if (!organizationId || !organizationId.trim()) {
        console.warn("❗ [useCashboxes] organizationId no está definido");
        throw new Error("No hay organización seleccionada");
      }
      const url = safeApiUrlWithParams("/", organizationId, "cashboxes");
      if (!url) {
        throw new Error("URL de API inválida");
      }
      return apiClient.get(url);
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
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  if (!id) {
    console.warn("❗ [useCashbox] id no está definido");
    return { cashbox: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useCashbox] organizationId no está definido");
    return { cashbox: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const cashboxUrl = safeApiUrlWithParams("/", organizationId, "cashboxes", id);
  
  const { data, error, isLoading, mutate } = useSWR(
    token && cashboxUrl ? cashboxUrl : null,
    () => {
      if (!cashboxUrl) {
        throw new Error("URL de caja inválida");
      }
      return apiClient.get(cashboxUrl);
    }
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
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "cashboxes");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [cashboxApi.update] id no está definido");
      throw new Error("ID de caja no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "cashboxes", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashboxApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [cashboxApi.delete] id no está definido");
      throw new Error("ID de caja no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "cashboxes", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

export function useCashMovements(cashboxId?: string) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useCashMovements] organizationId no está definido");
    return { movements: [], error: null, isLoading: false, mutate: async () => {} };
  }
  
  // Construir endpoint de forma segura
  const baseUrl = safeApiUrlWithParams("/", organizationId, "cash-movements");
  if (!baseUrl) {
    console.error("🔴 [useCashMovements] URL inválida");
    return { movements: [], error: new Error("URL de API inválida"), isLoading: false, mutate: async () => {} };
  }
  
  let endpoint: string;
  if (cashboxId && cashboxId.trim()) {
    endpoint = `${baseUrl}?cashboxId=${encodeURIComponent(cashboxId)}`;
  } else {
    endpoint = baseUrl;
  }
  
  if (!isValidApiUrl(endpoint)) {
    console.error("🔴 [useCashMovements] Endpoint inválido:", endpoint);
    return { movements: [], error: new Error("Endpoint inválido"), isLoading: false, mutate: async () => {} };
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
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  if (!id) {
    console.warn("❗ [useCashMovement] id no está definido");
    return { movement: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useCashMovement] organizationId no está definido");
    return { movement: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const movementUrl = safeApiUrlWithParams("/", organizationId, "cash-movements", id);
  
  const { data, error, isLoading, mutate } = useSWR(
    token && movementUrl ? movementUrl : null,
    () => {
      if (!movementUrl) {
        throw new Error("URL de movimiento inválida");
      }
      return apiClient.get(movementUrl);
    }
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
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashMovementApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "cash-movements");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashMovementApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [cashMovementApi.update] id no está definido");
      throw new Error("ID de movimiento no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "cash-movements", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [cashMovementApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [cashMovementApi.delete] id no está definido");
      throw new Error("ID de movimiento no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "cash-movements", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};
