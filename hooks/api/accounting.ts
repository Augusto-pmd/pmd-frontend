import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";

export function useAccounting() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && organizationId ? "accounting" : null,
    () => {
      if (!organizationId || !organizationId.trim()) {
        console.warn("❗ [useAccounting] organizationId no está definido");
        throw new Error("No hay organización seleccionada");
      }
      const url = safeApiUrlWithParams("/", organizationId, "accounting");
      if (!url) {
        throw new Error("URL de API inválida");
      }
      return apiClient.get(url);
    }
  );

  return {
    accounting: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingReport(id: string | null) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!id) {
    console.warn("❗ [useAccountingReport] id no está definido");
    return { report: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useAccountingReport] organizationId no está definido");
    return { report: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const reportUrl = safeApiUrlWithParams("/", organizationId, "accounting", id);
  
  const { data, error, isLoading, mutate } = useSWR(
    token && reportUrl ? reportUrl : null,
    () => {
      if (!reportUrl) {
        throw new Error("URL de reporte contable inválida");
      }
      return apiClient.get(reportUrl);
    }
  );

  return {
    report: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingSummary() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useAccountingSummary] organizationId no está definido");
    return { summary: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const summaryUrl = safeApiUrlWithParams("/", organizationId, "accounting", "summary");
  
  const { data, error, isLoading, mutate } = useSWR(
    token && summaryUrl ? summaryUrl : null,
    () => {
      if (!summaryUrl) {
        throw new Error("URL de resumen contable inválida");
      }
      return apiClient.get(summaryUrl);
    }
  );

  return {
    summary: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingTransactions(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useAccountingTransactions] organizationId no está definido");
    return { transactions: [], error: null, isLoading: false, mutate: async () => {} };
  }
  
  const queryString = params
    ? `?${new URLSearchParams(params as any).toString()}`
    : "";
  
  const baseUrl = safeApiUrlWithParams("/", organizationId, "accounting", "transactions");
  if (!baseUrl) {
    return { transactions: [], error: new Error("URL de API inválida"), isLoading: false, mutate: async () => {} };
  }
  const transactionsUrl = `${baseUrl}${queryString}`;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && transactionsUrl ? transactionsUrl : null,
    () => {
      if (!transactionsUrl) {
        throw new Error("URL de transacciones contables inválida");
      }
      return apiClient.get(transactionsUrl);
    }
  );

  return {
    transactions: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingMonth(month: number | null, year: number | null) {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!month || !year) {
    console.warn("❗ [useAccountingMonth] month o year no está definido");
    return { monthData: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useAccountingMonth] organizationId no está definido");
    return { monthData: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const monthUrl = safeApiUrlWithParams("/", organizationId, "accounting", "month", String(month), String(year));
  
  if (!monthUrl) {
    console.error("🔴 [useAccountingMonth] URL inválida");
    return { monthData: null, error: new Error("URL de mes contable inválida"), isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && monthUrl ? monthUrl : null,
    () => {
      if (!monthUrl) {
        throw new Error("URL de mes contable inválida");
      }
      return apiClient.get(monthUrl);
    }
  );

  return {
    monthData: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const accountingApi = {
  create: (data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [accountingApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "accounting");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [accountingApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [accountingApi.update] id no está definido");
      throw new Error("ID de movimiento contable no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "accounting", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [accountingApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [accountingApi.delete] id no está definido");
      throw new Error("ID de movimiento contable no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "accounting", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
  generateReport: (params: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [accountingApi.generateReport] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "accounting", "reports");
    if (!url) throw new Error("URL de reporte inválida");
    return apiClient.post(url, params);
  },
  createTransaction: (data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [accountingApi.createTransaction] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "accounting", "transactions");
    if (!url) throw new Error("URL de transacción inválida");
    return apiClient.post(url, data);
  },
  getSummary: () => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [accountingApi.getSummary] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "accounting", "summary");
    if (!url) throw new Error("URL de resumen inválida");
    return apiClient.get(url);
  },
  getMonth: (month: number, year: number) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [accountingApi.getMonth] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "accounting", "month", String(month), String(year));
    if (!url) throw new Error("URL de mes contable inválida");
    return apiClient.get(url);
  },
};
