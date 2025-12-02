import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/employees`;

export function useEmployees() {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token ? API_BASE : null,
    () => apiClient.get(API_BASE)
  );

  return {
    employees: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useEmployee(id: string | null) {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `${API_BASE}/${id}` : null,
    () => apiClient.get(`${API_BASE}/${id}`)
  );

  return {
    employee: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export function useEmployeeAssignments(id: string | null) {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `${API_BASE}/${id}/assignments` : null,
    () => apiClient.get(`${API_BASE}/${id}/assignments`)
  );

  return {
    assignments: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export const employeeApi = {
  create: (data: any) => apiClient.post(API_BASE, data),
  update: (id: string, data: any) => apiClient.put(`${API_BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${API_BASE}/${id}`),
  assignToWork: (employeeId: string, workId: string, data: any) =>
    apiClient.post(`${API_BASE}/${employeeId}/assignments`, { workId, ...data }),
};

