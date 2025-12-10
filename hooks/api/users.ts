import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useUsers() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "users" : null,
    () => {
      return apiClient.get("/users");
    }
  );

  return {
    users: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useUser(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    console.warn("❗ [useUser] id no está definido");
    return { user: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `users/${id}` : null,
    () => {
      return apiClient.get(`/users/${id}`);
    }
  );

  return {
    user: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const userApi = {
  create: (data: any) => {
    return apiClient.post("/users", data);
  },
  update: (id: string, data: any) => {
    if (!id) {
      console.warn("❗ [userApi.update] id no está definido");
      throw new Error("ID de usuario no está definido");
    }
    return apiClient.put(`/users/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      console.warn("❗ [userApi.delete] id no está definido");
      throw new Error("ID de usuario no está definido");
    }
    return apiClient.delete(`/users/${id}`);
  },
};

