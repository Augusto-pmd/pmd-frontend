import useSWR from "swr";
import { fetcher } from "./useSWRConfig";
import { apiClient } from "@/lib/api-client";
import { mutate } from "swr";

export interface User {
  id: string;
  email: string;
  name: string;
  role: { id: number | string; name: string; permissions?: string[] };
  roleId?: number | string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useUsers() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<User[]>("/users", fetcher);

  const createUser = async (userData: Partial<User>) => {
    const newUser = await apiClient.create<User>("/users", userData);
    await revalidate();
    return newUser;
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    const updatedUser = await apiClient.update<User>("/users", id, userData);
    await revalidate();
    return updatedUser;
  };

  const deleteUser = async (id: string) => {
    await apiClient.delete("/users", id);
    await revalidate();
  };

  return {
    users: data || [],
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    revalidate,
  };
}

export function useUser(id: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<User | null>(
    id ? `/users/${id}` : null,
    fetcher
  );

  return {
    user: data || null,
    isLoading,
    error,
    revalidate,
  };
}

