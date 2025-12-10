import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useExpenses() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/expenses");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "expenses" : null,
    fetcher
  );

  return {
    expenses: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useExpense(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    console.warn("❗ [useExpense] id no está definido");
    return { expense: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `expenses/${id}` : null,
    () => {
      return apiClient.get(`/expenses/${id}`);
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
    return apiClient.post("/expenses", data);
  },
  update: (id: string, data: any) => {
    if (!id) {
      console.warn("❗ [expenseApi.update] id no está definido");
      throw new Error("ID de gasto no está definido");
    }
    return apiClient.put(`/expenses/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      console.warn("❗ [expenseApi.delete] id no está definido");
      throw new Error("ID de gasto no está definido");
    }
    return apiClient.delete(`/expenses/${id}`);
  },
};
