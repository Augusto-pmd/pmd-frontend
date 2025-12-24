import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useAlerts() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/alerts");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "alerts" : null,
    fetcher
  );

  return {
    alerts: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAlert(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useAlert] id no está definido");
    }
    return { alert: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `alerts/${id}` : null,
    () => {
      return apiClient.get(`/alerts/${id}`);
    }
  );

  return {
    alert: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export function useUnreadAlerts() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "alerts/unread" : null,
    () => {
      return apiClient.get("/alerts/unread");
    }
  );

  return {
    unreadAlerts: data?.data || data || [],
    unreadCount: Array.isArray(data?.data || data) ? (data?.data || data).length : 0,
    error,
    isLoading,
    mutate,
  };
}

export const alertApi = {
  create: (data: unknown) => {
    return apiClient.post("/alerts", data);
  },
  update: (id: string, data: unknown) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertApi.update] id no está definido");
      }
      throw new Error("ID de alerta no está definido");
    }
    return apiClient.put(`/alerts/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertApi.delete] id no está definido");
      }
      throw new Error("ID de alerta no está definido");
    }
    return apiClient.delete(`/alerts/${id}`);
  },
  markAsRead: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertApi.markAsRead] id no está definido");
      }
      throw new Error("ID de alerta no está definido");
    }
    return apiClient.patch(`/alerts/${id}/read`, {});
  },
};
