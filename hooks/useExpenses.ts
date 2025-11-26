import useSWR from "swr";
import { fetcher } from "./useSWRConfig";
import { apiClient } from "@/lib/api-client";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category?: string;
  date: string;
  workId?: string;
  supplierId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useExpenses() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Expense[]>("/expenses", fetcher);

  const createExpense = async (expenseData: Partial<Expense>) => {
    const newExpense = await apiClient.create<Expense>("/expenses", expenseData);
    await revalidate();
    return newExpense;
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    const updatedExpense = await apiClient.update<Expense>("/expenses", id, expenseData);
    await revalidate();
    return updatedExpense;
  };

  const deleteExpense = async (id: string) => {
    await apiClient.delete("/expenses", id);
    await revalidate();
  };

  return {
    expenses: data || [],
    isLoading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    revalidate,
  };
}

export function useExpense(id: string | null) {
  const { data, error, isLoading } = useSWR<Expense | null>(
    id ? `/expenses/${id}` : null,
    fetcher
  );

  return {
    expense: data || null,
    isLoading,
    error,
  };
}

