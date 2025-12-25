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
    accounting: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingReport(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useAccountingReport] id no está definido");
    }
    return { report: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `accounting/${id}` : null,
    () => {
      return apiClient.get(`/accounting/${id}`);
    }
  );

  return {
    report: (data as any)?.data || data,
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
    summary: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingTransactions(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
  
  const transactionsUrl = `/accounting/transactions${queryString}`;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && transactionsUrl ? transactionsUrl : null,
    () => {
      return apiClient.get(transactionsUrl);
    }
  );

  return {
    transactions: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingMonth(month: number | null, year: number | null) {
  const { token } = useAuthStore();
  
  if (!month || !year) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useAccountingMonth] month o year no está definido");
    }
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
    monthData: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingPurchasesBook(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? `accounting/purchases-book${queryString}` : null,
    () => {
      return apiClient.get(`/accounting/purchases-book${queryString}`);
    }
  );

  return {
    purchasesBook: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingWithholdings(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? `accounting/withholdings${queryString}` : null,
    () => {
      return apiClient.get(`/accounting/withholdings${queryString}`);
    }
  );

  return {
    withholdings: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingPerceptions(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? `accounting/perceptions${queryString}` : null,
    () => {
      return apiClient.get(`/accounting/perceptions${queryString}`);
    }
  );

  return {
    perceptions: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export const accountingApi = {
  getMonth: (month: number, year: number) => {
    return apiClient.get(`/accounting/month/${month}/${year}`);
  },
  getPurchasesBook: (params?: { startDate?: string; endDate?: string }) => {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    return apiClient.get(`/accounting/purchases-book${queryString}`);
  },
  getWithholdings: (params?: { startDate?: string; endDate?: string }) => {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    return apiClient.get(`/accounting/withholdings${queryString}`);
  },
  getPerceptions: (params?: { startDate?: string; endDate?: string }) => {
    const queryString = params
      ? `?${new URLSearchParams(params as any).toString()}`
      : "";
    return apiClient.get(`/accounting/perceptions${queryString}`);
  },
};
