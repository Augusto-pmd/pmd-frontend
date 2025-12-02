import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrl, safeApiUrlWithParams } from "@/lib/safeApi";
import { SIMULATION_MODE, SIMULATED_STAFF } from "@/lib/useSimulation";

const API_BASE = safeApiUrl("/employees");

export function useEmployees() {
  const { token } = useAuthStore();
  
  // Si está en modo simulación, usar un fetcher que retorna datos dummy
  const fetcher = SIMULATION_MODE
    ? () => Promise.resolve({ data: SIMULATED_STAFF })
    : () => {
        if (!API_BASE) {
          throw new Error("API_BASE no está definido correctamente");
        }
        return apiClient.get(API_BASE);
      };
  
  if (!API_BASE && !SIMULATION_MODE) {
    console.error("🔴 [useEmployees] API_BASE es inválido");
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    SIMULATION_MODE || (token && API_BASE) ? "employees" : null,
    fetcher
  );

  return {
    employees: data?.data || data || [],
    error,
    isLoading: SIMULATION_MODE ? false : isLoading,
    mutate,
  };
}

export function useEmployee(id: string | null) {
  const { token } = useAuthStore();
  
  const employeeUrl = id && API_BASE ? safeApiUrlWithParams("/employees", id) : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && employeeUrl ? employeeUrl : null,
    () => {
      if (!employeeUrl) {
        throw new Error("URL de empleado inválida");
      }
      return apiClient.get(employeeUrl);
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
  
  const assignmentsUrl = id && API_BASE ? safeApiUrlWithParams("/employees", id, "assignments") : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && assignmentsUrl ? assignmentsUrl : null,
    () => {
      if (!assignmentsUrl) {
        throw new Error("URL de asignaciones inválida");
      }
      return apiClient.get(assignmentsUrl);
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
    if (!API_BASE) throw new Error("API_BASE no está definido");
    return apiClient.post(API_BASE, data);
  },
  update: (id: string, data: any) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/employees", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    if (!API_BASE || !id) throw new Error("API_BASE o id no está definido");
    const url = safeApiUrlWithParams("/employees", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
  assignToWork: (employeeId: string, workId: string, data: any) => {
    if (!API_BASE || !employeeId || !workId) {
      throw new Error("API_BASE, employeeId o workId no está definido");
    }
    const url = safeApiUrlWithParams("/employees", employeeId, "assignments");
    if (!url) throw new Error("URL de asignación inválida");
    return apiClient.post(url, { workId, ...data });
  },
};

