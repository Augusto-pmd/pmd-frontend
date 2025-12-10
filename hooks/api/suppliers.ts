import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useSuppliers() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/suppliers");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "suppliers" : null,
    fetcher
  );

  return {
    suppliers: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useSupplier(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    console.warn("❗ [useSupplier] id no está definido");
    return { supplier: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `suppliers/${id}` : null,
    () => {
      return apiClient.get(`/suppliers/${id}`);
    }
  );

  return {
    supplier: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const supplierApi = {
  create: (data: any) => {
    return apiClient.post("/suppliers", data);
  },
  update: (id: string, data: any) => {
    if (!id) {
      console.warn("❗ [supplierApi.update] id no está definido");
      throw new Error("ID de proveedor no está definido");
    }
    return apiClient.put(`/suppliers/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      console.warn("❗ [supplierApi.delete] id no está definido");
      throw new Error("ID de proveedor no está definido");
    }
    return apiClient.delete(`/suppliers/${id}`);
  },
};

