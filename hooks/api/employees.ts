import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useEmployees() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/employees");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "employees" : null,
    fetcher
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
  
  if (!id) {
    console.warn("❗ [useEmployee] id no está definido");
    return { employee: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `employees/${id}` : null,
    () => {
      return apiClient.get(`/employees/${id}`);
    }
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
  
  if (!id) {
    console.warn("❗ [useEmployeeAssignments] id no está definido");
    return { assignments: [], error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `employees/${id}/assignments` : null,
    () => {
      return apiClient.get(`/employees/${id}/assignments`);
    }
  );

  return {
    assignments: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export const employeeApi = {
  create: (data: any) => {
    return apiClient.post("/employees", data);
  },
  update: (id: string, data: any) => {
    if (!id) {
      console.warn("❗ [employeeApi.update] id no está definido");
      throw new Error("ID de empleado no está definido");
    }
    return apiClient.put(`/employees/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      console.warn("❗ [employeeApi.delete] id no está definido");
      throw new Error("ID de empleado no está definido");
    }
    return apiClient.delete(`/employees/${id}`);
  },
  assignToWork: (employeeId: string, workId: string, data: any) => {
    if (!employeeId) {
      console.warn("❗ [employeeApi.assignToWork] employeeId no está definido");
      throw new Error("ID de empleado no está definido");
    }
    
    if (!workId) {
      console.warn("❗ [employeeApi.assignToWork] workId no está definido");
      throw new Error("ID de obra no está definido");
    }
    
    return apiClient.post(`/employees/${employeeId}/assignments`, { workId, ...data });
  },
};

