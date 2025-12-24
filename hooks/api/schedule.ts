import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useSchedule(params?: { startDate?: string; endDate?: string; workId?: string }) {
  const { token } = useAuthStore();
  
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? `schedule${queryString}` : null,
    () => {
      return apiClient.get(`/schedule${queryString}`);
    }
  );

  return {
    schedule: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useScheduleItem(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useScheduleItem] id no está definido");
    }
    return { item: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `schedule/${id}` : null,
    () => {
      return apiClient.get(`/schedule/${id}`);
    }
  );

  return {
    item: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const scheduleApi = {
  create: (data: unknown) => {
    return apiClient.post("/schedule", data);
  },
  update: (id: string, data: unknown) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [scheduleApi.update] id no está definido");
      }
      throw new Error("ID de item de cronograma no está definido");
    }
    return apiClient.put(`/schedule/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [scheduleApi.delete] id no está definido");
      }
      throw new Error("ID de item de cronograma no está definido");
    }
    return apiClient.delete(`/schedule/${id}`);
  },
};

