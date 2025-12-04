import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";

export function useIncomes() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  const fetcher = () => {
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [useIncomes] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    const url = safeApiUrlWithParams("/", organizationId, "incomes");
    if (!url) {
      throw new Error("URL de API inválida");
    }
    return apiClient.get(url);
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token && organizationId ? "incomes" : null,
    fetcher
  );

  return {
    incomes: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useIncome(id: string | null) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!id) {
    console.warn("❗ [useIncome] id no está definido");
    return { income: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useIncome] organizationId no está definido");
    return { income: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const incomeUrl = safeApiUrlWithParams("/", organizationId, "incomes", id);
  
  const { data, error, isLoading, mutate } = useSWR(
    token && incomeUrl ? incomeUrl : null,
    () => {
      if (!incomeUrl) {
        throw new Error("URL de ingreso inválida");
      }
      return apiClient.get(incomeUrl);
    }
  );

  return {
    income: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const incomeApi = {
  create: (data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [incomeApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "incomes");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [incomeApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [incomeApi.update] id no está definido");
      throw new Error("ID de ingreso no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "incomes", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [incomeApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [incomeApi.delete] id no está definido");
      throw new Error("ID de ingreso no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "incomes", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};
