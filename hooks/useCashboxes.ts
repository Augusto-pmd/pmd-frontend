import useSWR from "swr";
import { fetcher } from "./useSWRConfig";
import { apiClient } from "@/lib/api-client";

export interface Cashbox {
  id: string;
  name: string;
  balance: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CashMovement {
  id: string;
  cashboxId: string;
  type: "income" | "expense";
  amount: number;
  description?: string;
  date: string;
  createdAt?: string;
}

export function useCashboxes() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Cashbox[]>("/cashboxes", fetcher);

  const createCashbox = async (cashboxData: Partial<Cashbox>) => {
    const newCashbox = await apiClient.create<Cashbox>("/cashboxes", cashboxData);
    await revalidate();
    return newCashbox;
  };

  const updateCashbox = async (id: string, cashboxData: Partial<Cashbox>) => {
    const updatedCashbox = await apiClient.update<Cashbox>("/cashboxes", id, cashboxData);
    await revalidate();
    return updatedCashbox;
  };

  const deleteCashbox = async (id: string) => {
    await apiClient.delete("/cashboxes", id);
    await revalidate();
  };

  return {
    cashboxes: data || [],
    isLoading,
    error,
    createCashbox,
    updateCashbox,
    deleteCashbox,
    revalidate,
  };
}

export function useCashbox(id: string | null) {
  const { data, error, isLoading } = useSWR<Cashbox | null>(
    id ? `/cashboxes/${id}` : null,
    fetcher
  );

  return {
    cashbox: data || null,
    isLoading,
    error,
  };
}

export function useCashMovements(cashboxId: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<CashMovement[]>(
    cashboxId ? `/cash-movements?cashboxId=${cashboxId}` : null,
    fetcher
  );

  const createMovement = async (movementData: Partial<CashMovement>) => {
    const newMovement = await apiClient.create<CashMovement>("/cash-movements", movementData);
    await revalidate();
    return newMovement;
  };

  const deleteMovement = async (id: string) => {
    await apiClient.delete("/cash-movements", id);
    await revalidate();
  };

  return {
    movements: data || [],
    isLoading,
    error,
    createMovement,
    deleteMovement,
    revalidate,
  };
}

