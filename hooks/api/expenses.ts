import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_EXPENSES } from "@/lib/useSimulation";

export function useExpenses() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  // Si está en modo simulación, usar un fetcher que retorna datos dummy
  const fetcher = SIMULATION_MODE
    ? () => Promise.resolve({ data: SIMULATED_EXPENSES })
    : () => {
        if (!organizationId || !organizationId.trim()) {
          console.warn("❗ [useExpenses] organizationId no está definido");
          throw new Error("No hay organización seleccionada");
        }
        const url = safeApiUrlWithParams("/", organizationId, "expenses");
        if (!url) {
          throw new Error("URL de API inválida");
        }
        return apiClient.get(url);
      };
  
  const { data, error, isLoading, mutate } = useSWR(
    SIMULATION_MODE || (token && organizationId) ? "expenses" : null,
    fetcher
  );

  return {
    expenses: data?.data || data || [],
    error,
    isLoading: SIMULATION_MODE ? false : isLoading,
    mutate,
  };
}

export function useExpense(id: string | null) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
  
  if (!id) {
    console.warn("❗ [useExpense] id no está definido");
    return { expense: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useExpense] organizationId no está definido");
    return { expense: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const expenseUrl = safeApiUrlWithParams("/", organizationId, "expenses", id);
  
  const { data, error, isLoading, mutate } = useSWR(
    token && expenseUrl ? expenseUrl : null,
    () => {
      if (!expenseUrl) {
        throw new Error("URL de gasto inválida");
      }
      return apiClient.get(expenseUrl);
    }
  );

  return {
    expense: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const expenseApi = {
  create: (data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [expenseApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "expenses");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [expenseApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [expenseApi.update] id no está definido");
      throw new Error("ID de gasto no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "expenses", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [expenseApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [expenseApi.delete] id no está definido");
      throw new Error("ID de gasto no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "expenses", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};
