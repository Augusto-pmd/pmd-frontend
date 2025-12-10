import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useAccounting() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "accounting" : null,
    () => {
      return apiClient.get("/accounting");
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
  
  if (!id) {
    console.warn("❗ [useAccountingReport] id no está definido");
    return { report: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `accounting/${id}` : null,
    () => {
      return apiClient.get(`/accounting/${id}`);
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
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "accounting/summary" : null,
    () => {
      return apiClient.get("/accounting/summary");
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
  
  const transactionsUrl = `/accounting/transactions${queryString}`;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && transactionsUrl ? transactionsUrl : null,
    () => {
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
  
  if (!month || !year) {
    console.warn("❗ [useAccountingMonth] month o year no está definido");
    return { monthData: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const monthUrl = `/accounting/month/${month}/${year}`;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && monthUrl ? monthUrl : null,
    () => {
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
    return apiClient.post("/accounting", data);
  },
  update: (id: string, data: any) => {
    if (!id) {
      console.warn("❗ [accountingApi.update] id no está definido");
      throw new Error("ID de movimiento contable no está definido");
    }
    return apiClient.put(`/accounting/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      console.warn("❗ [accountingApi.delete] id no está definido");
      throw new Error("ID de movimiento contable no está definido");
    }
    return apiClient.delete(`/accounting/${id}`);
  },
  generateReport: (params: any) => {
    return apiClient.post("/accounting/reports", params);
  },
  createTransaction: (data: any) => {
    return apiClient.post("/accounting/transactions", data);
  },
  getSummary: () => {
    return apiClient.get("/accounting/summary");
  },
  getMonth: (month: number, year: number) => {
    return apiClient.get(`/accounting/month/${month}/${year}`);
  },
};
