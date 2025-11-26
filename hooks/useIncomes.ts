import useSWR from "swr";
import { fetcher } from "./useSWRConfig";
import { apiClient } from "@/lib/api-client";

export interface Income {
  id: string;
  description: string;
  amount: number;
  source?: string;
  date: string;
  workId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useIncomes() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Income[]>("/incomes", fetcher);

  const createIncome = async (incomeData: Partial<Income>) => {
    const newIncome = await apiClient.create<Income>("/incomes", incomeData);
    await revalidate();
    return newIncome;
  };

  const updateIncome = async (id: string, incomeData: Partial<Income>) => {
    const updatedIncome = await apiClient.update<Income>("/incomes", id, incomeData);
    await revalidate();
    return updatedIncome;
  };

  const deleteIncome = async (id: string) => {
    await apiClient.delete("/incomes", id);
    await revalidate();
  };

  return {
    incomes: data || [],
    isLoading,
    error,
    createIncome,
    updateIncome,
    deleteIncome,
    revalidate,
  };
}

export function useIncome(id: string | null) {
  const { data, error, isLoading } = useSWR<Income | null>(id ? `/incomes/${id}` : null, fetcher);

  return {
    income: data || null,
    isLoading,
    error,
  };
}

