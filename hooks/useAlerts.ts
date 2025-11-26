import useSWR from "swr";
import { fetcher } from "./useSWRConfig";
import { apiClient } from "@/lib/api-client";

export interface Alert {
  id: string;
  title: string;
  message: string;
  type?: string;
  status?: "read" | "unread";
  userId?: string;
  createdAt?: string;
}

export function useAlerts() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Alert[]>("/alerts", fetcher);

  const markAsRead = async (id: string) => {
    await apiClient.patch("/alerts", id, { status: "read" });
    await revalidate();
  };

  const deleteAlert = async (id: string) => {
    await apiClient.delete("/alerts", id);
    await revalidate();
  };

  return {
    alerts: data || [],
    isLoading,
    error,
    markAsRead,
    deleteAlert,
    revalidate,
  };
}

