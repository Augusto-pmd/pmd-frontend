import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";

// Construir API_BASE de forma segura
const API_BASE = safeApiUrl("/accounting");

export function useAccounting() {
  const { token } = useAuthStore();
  
  if (!API_BASE) {
    console.error("🔴 [useAccounting] API_BASE es inválido");
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
    accounting: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingReport(id: string | null) {
  const { token } = useAuthStore();
  
  const reportUrl = id && API_BASE ? safeApiUrlWithParams("/accounting", id) : null;
  
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
  
  const summaryUrl = API_BASE ? safeApiUrl("/accounting/summary") : null;
  
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
  
  const queryString = params
    ? `?${new URLSearchParams(params as any).toString()}`
    : "";
  
  const transactionsUrl = API_BASE ? `${safeApiUrl("/accounting/transactions")}${queryString}` : null;
  
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
  
  const monthUrl = token && month && year && API_BASE 
    ? safeApiUrlWithParams("/accounting/month", String(month), String(year))
    : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    monthUrl,
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
    if (!API_BASE) throw new Error("API_BASE no está definido");
    return apiClient.post(API_BASE, data);
  },
  update: (id: string, data: any) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/accounting", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/accounting", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
  generateReport: (params: any) => {
    if (!API_BASE) throw new Error("API_BASE no está definido");
    const url = safeApiUrl("/accounting/reports");
    if (!url) throw new Error("URL de reporte inválida");
    return apiClient.post(url, params);
  },
  createTransaction: (data: any) => {
    if (!API_BASE) throw new Error("API_BASE no está definido");
    const url = safeApiUrl("/accounting/transactions");
    if (!url) throw new Error("URL de transacción inválida");
    return apiClient.post(url, data);
  },
  getSummary: () => {
    if (!API_BASE) throw new Error("API_BASE no está definido");
    const url = safeApiUrl("/accounting/summary");
    if (!url) throw new Error("URL de resumen inválida");
    return apiClient.get(url);
  },
  getMonth: (month: number, year: number) => {
    if (!API_BASE) throw new Error("API_BASE no está definido");
    const url = safeApiUrlWithParams("/accounting/month", String(month), String(year));
    if (!url) throw new Error("URL de mes contable inválida");
    return apiClient.get(url);
  },
};

