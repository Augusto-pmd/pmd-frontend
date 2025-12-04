import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { safeApiUrlWithParams } from "@/lib/safeApi";

export function useEmployees() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  const fetcher = () => {
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [useEmployees] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    const url = safeApiUrlWithParams("/", organizationId, "employees");
    if (!url) {
      throw new Error("URL de API inválida");
    }
    return apiClient.get(url);
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token && organizationId ? "employees" : null,
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
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!id) {
    console.warn("❗ [useEmployee] id no está definido");
    return { employee: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useEmployee] organizationId no está definido");
    return { employee: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const employeeUrl = safeApiUrlWithParams("/", organizationId, "employees", id);
  
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
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  
  if (!id) {
    console.warn("❗ [useEmployeeAssignments] id no está definido");
    return { assignments: [], error: null, isLoading: false, mutate: async () => {} };
  }
  
  if (!organizationId || !organizationId.trim()) {
    console.warn("❗ [useEmployeeAssignments] organizationId no está definido");
    return { assignments: [], error: null, isLoading: false, mutate: async () => {} };
  }
  
  const assignmentsUrl = safeApiUrlWithParams("/", organizationId, "employees", id, "assignments");
  
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
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [employeeApi.create] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "employees");
    if (!url) throw new Error("URL de API inválida");
    return apiClient.post(url, data);
  },
  update: (id: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [employeeApi.update] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [employeeApi.update] id no está definido");
      throw new Error("ID de empleado no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "employees", id);
    if (!url) throw new Error("URL de actualización inválida");
    return apiClient.put(url, data);
  },
  delete: (id: string) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [employeeApi.delete] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!id) {
      console.warn("❗ [employeeApi.delete] id no está definido");
      throw new Error("ID de empleado no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "employees", id);
    if (!url) throw new Error("URL de eliminación inválida");
    return apiClient.delete(url);
  },
  assignToWork: (employeeId: string, workId: string, data: any) => {
    const authState = useAuthStore.getState();
    const organizationId = authState.user?.organizationId;
    
    if (!organizationId || !organizationId.trim()) {
      console.warn("❗ [employeeApi.assignToWork] organizationId no está definido");
      throw new Error("No hay organización seleccionada");
    }
    
    if (!employeeId) {
      console.warn("❗ [employeeApi.assignToWork] employeeId no está definido");
      throw new Error("ID de empleado no está definido");
    }
    
    if (!workId) {
      console.warn("❗ [employeeApi.assignToWork] workId no está definido");
      throw new Error("ID de obra no está definido");
    }
    
    const url = safeApiUrlWithParams("/", organizationId, "employees", employeeId, "assignments");
    if (!url) throw new Error("URL de asignación inválida");
    return apiClient.post(url, { workId, ...data });
  },
};

