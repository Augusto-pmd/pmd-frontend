import useSWR from "swr";
import { fetcher } from "./useSWRConfig";
import { apiClient } from "@/lib/api-client";

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export function useRoles() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Role[]>("/roles", fetcher);

  const createRole = async (roleData: Partial<Role>) => {
    const newRole = await apiClient.create<Role>("/roles", roleData);
    await revalidate();
    return newRole;
  };

  const updateRole = async (id: string, roleData: Partial<Role>) => {
    const updatedRole = await apiClient.update<Role>("/roles", id, roleData);
    await revalidate();
    return updatedRole;
  };

  const deleteRole = async (id: string) => {
    await apiClient.delete("/roles", id);
    await revalidate();
  };

  return {
    roles: data || [],
    isLoading,
    error,
    createRole,
    updateRole,
    deleteRole,
    revalidate,
  };
}

