import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";

const API_BASE = safeApiUrl("/expenses");

export function useExpenses() {
  const { token } = useAuthStore();
  
  if (!API_BASE) {
    console.error("🔴 [useExpenses] API_BASE es inválido");
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
    expenses: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useExpense(id: string | null) {
  const { token } = useAuthStore();
  
  const expenseUrl = id && API_BASE ? safeApiUrlWithParams("/expenses", id) : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && expenseUrl ? expenseUrl : null,
    () => {
      if (!expenseUrl) {
        throw new Error("URL de gasto inválida");
      }
      return apiClient.get(expenseUrl);
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
    if (!API_BASE) throw new Error("API_BASE no está definido");
    return apiClient.post(API_BASE, data);
  },
  update: (id: string, data: any) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/expenses", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/expenses", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
};

