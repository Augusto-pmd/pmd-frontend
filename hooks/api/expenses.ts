import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Expense, CreateExpenseData, UpdateExpenseData } from "@/lib/types/expense";

export function useExpenses() {
  const { token } = useAuthStore();
  
  const fetcher = async (): Promise<Expense[]> => {
    const response = await apiClient.get<Expense[]>("/expenses");
    return response?.data || response || [];
  };
  
  const { data, error, isLoading, mutate } = useSWR<Expense[]>(
    token ? "expenses" : null,
    fetcher
  );

  return {
    expenses: data || [],
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
  
  const fetcher = async (): Promise<Expense> => {
    const response = await apiClient.get<Expense>(`/expenses/${id}`);
    return response?.data || response;
  };
  
  const { data, error, isLoading, mutate } = useSWR<Expense>(
    token && id ? `expenses/${id}` : null,
    fetcher
  );

  return {
    expense: data || null,
    error,
    isLoading,
    mutate,
  };
}

export const expenseApi = {
  create: (data: CreateExpenseData) => {
    return apiClient.post<Expense>("/expenses", data);
  },
  update: (id: string, data: UpdateExpenseData) => {
    if (!id) {
      console.warn("❗ [expenseApi.update] id no está definido");
      throw new Error("ID de gasto no está definido");
    }
    return apiClient.put<Expense>(`/expenses/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      console.warn("❗ [expenseApi.delete] id no está definido");
      throw new Error("ID de gasto no está definido");
    }
    return apiClient.delete(`/expenses/${id}`);
  },
  validate: (id: string, state: "validated" | "observed" | "annulled", observations?: string) => {
    if (!id) {
      console.warn("❗ [expenseApi.validate] id no está definido");
      throw new Error("ID de gasto no está definido");
    }
    return apiClient.patch<Expense>(`/expenses/${id}/validate`, {
      state,
      observations,
    });
  },
};
