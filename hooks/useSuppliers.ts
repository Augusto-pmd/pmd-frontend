import useSWR from "swr";
import { fetcher } from "./useSWRConfig";
import { apiClient } from "@/lib/api-client";

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierDocument {
  id: string;
  supplierId: string;
  name: string;
  type?: string;
  url?: string;
  createdAt?: string;
}

export function useSuppliers() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Supplier[]>("/suppliers", fetcher);

  const createSupplier = async (supplierData: Partial<Supplier>) => {
    const newSupplier = await apiClient.create<Supplier>("/suppliers", supplierData);
    await revalidate();
    return newSupplier;
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    const updatedSupplier = await apiClient.update<Supplier>("/suppliers", id, supplierData);
    await revalidate();
    return updatedSupplier;
  };

  const deleteSupplier = async (id: string) => {
    await apiClient.delete("/suppliers", id);
    await revalidate();
  };

  return {
    suppliers: data || [],
    isLoading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    revalidate,
  };
}

export function useSupplier(id: string | null) {
  const { data, error, isLoading } = useSWR<Supplier | null>(
    id ? `/suppliers/${id}` : null,
    fetcher
  );

  return {
    supplier: data || null,
    isLoading,
    error,
  };
}

export function useSupplierDocuments(supplierId: string | null) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<SupplierDocument[]>(
    supplierId ? `/supplier-documents?supplierId=${supplierId}` : null,
    fetcher
  );

  const uploadDocument = async (documentData: Partial<SupplierDocument>) => {
    const newDoc = await apiClient.create<SupplierDocument>("/supplier-documents", documentData);
    await revalidate();
    return newDoc;
  };

  const deleteDocument = async (id: string) => {
    await apiClient.delete("/supplier-documents", id);
    await revalidate();
  };

  return {
    documents: data || [],
    isLoading,
    error,
    uploadDocument,
    deleteDocument,
    revalidate,
  };
}

