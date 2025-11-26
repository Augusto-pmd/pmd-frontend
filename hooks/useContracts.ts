import useSWR from "swr";
import { fetcher } from "./useSWRConfig";
import { apiClient } from "@/lib/api-client";

export interface Contract {
  id: string;
  supplierId?: string;
  workId?: string;
  contractNumber?: string;
  startDate?: string;
  endDate?: string;
  value?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useContracts() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Contract[]>("/contracts", fetcher);

  const createContract = async (contractData: Partial<Contract>) => {
    const newContract = await apiClient.create<Contract>("/contracts", contractData);
    await revalidate();
    return newContract;
  };

  const updateContract = async (id: string, contractData: Partial<Contract>) => {
    const updatedContract = await apiClient.update<Contract>("/contracts", id, contractData);
    await revalidate();
    return updatedContract;
  };

  const deleteContract = async (id: string) => {
    await apiClient.delete("/contracts", id);
    await revalidate();
  };

  return {
    contracts: data || [],
    isLoading,
    error,
    createContract,
    updateContract,
    deleteContract,
    revalidate,
  };
}

export function useContract(id: string | null) {
  const { data, error, isLoading } = useSWR<Contract | null>(
    id ? `/contracts/${id}` : null,
    fetcher
  );

  return {
    contract: data || null,
    isLoading,
    error,
  };
}

