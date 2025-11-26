import useSWR from "swr";
import { fetcher } from "./useSWRConfig";
import { apiClient } from "@/lib/api-client";

export interface Work {
  id: string;
  title: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkBudget {
  id: string;
  workId: string;
  category?: string;
  amount: number;
  description?: string;
  createdAt?: string;
}

export function useWorks() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Work[]>("/works", fetcher);

  const createWork = async (workData: Partial<Work>) => {
    const newWork = await apiClient.create<Work>("/works", workData);
    await revalidate();
    return newWork;
  };

  const updateWork = async (id: string, workData: Partial<Work>) => {
    const updatedWork = await apiClient.update<Work>("/works", id, workData);
    await revalidate();
    return updatedWork;
  };

  const deleteWork = async (id: string) => {
    await apiClient.delete("/works", id);
    await revalidate();
  };

  return {
    works: data || [],
    isLoading,
    error,
    createWork,
    updateWork,
    deleteWork,
    revalidate,
  };
}

export function useWork(id: string | null) {
  const { data, error, isLoading } = useSWR<Work | null>(id ? `/works/${id}` : null, fetcher);

  return {
    work: data || null,
    isLoading,
    error,
  };
}

export function useWorkBudgets(workId: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<WorkBudget[]>(
    workId ? `/work-budgets?workId=${workId}` : null,
    fetcher
  );

  const createBudget = async (budgetData: Partial<WorkBudget>) => {
    const newBudget = await apiClient.create<WorkBudget>("/work-budgets", budgetData);
    await revalidate();
    return newBudget;
  };

  const updateBudget = async (id: string, budgetData: Partial<WorkBudget>) => {
    const updatedBudget = await apiClient.update<WorkBudget>("/work-budgets", id, budgetData);
    await revalidate();
    return updatedBudget;
  };

  const deleteBudget = async (id: string) => {
    await apiClient.delete("/work-budgets", id);
    await revalidate();
  };

  return {
    budgets: data || [],
    isLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    revalidate,
  };
}

