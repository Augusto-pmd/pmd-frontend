"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSuppliers, supplierApi } from "@/hooks/api/suppliers";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { SupplierForm } from "@/components/forms/SupplierForm";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSWRConfig } from "swr";

function SuppliersContent() {
  const { suppliers, isLoading, error, mutate } = useSuppliers();
  const { mutate: globalMutate } = useSWRConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    setDeleteLoading(id);
    try {
      await supplierApi.delete(id);
      mutate();
      globalMutate("/suppliers");
    } catch (error: any) {
      alert(error.message || "Failed to delete supplier");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingSupplier) {
        await supplierApi.update(editingSupplier.id, data);
      } else {
        await supplierApi.create(data);
      }
      mutate();
      globalMutate("/suppliers");
      setIsModalOpen(false);
      setEditingSupplier(null);
    } catch (error: any) {
      alert(error.message || "Failed to save supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Loading suppliers..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error loading suppliers: {error.message || "Unknown error"}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Suppliers – PMD Backend Integration</h1>
            <p className="text-gray-600">Manage supplier relationships</p>
          </div>
          <Button onClick={handleCreate}>+ Add Supplier</Button>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Total Suppliers</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">{suppliers?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Active Suppliers</p>
                <p className="text-2xl font-bold text-green-600">
                  {suppliers?.filter((s: any) => s.status !== "inactive").length || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Pending Contracts</p>
                <p className="text-2xl font-bold text-yellow-600">0</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Supplier List</h2>
            {suppliers?.length === 0 ? (
              <EmptyState
                title="No suppliers found"
                description="Create your first supplier to get started"
                action={<Button onClick={handleCreate}>Create Supplier</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {suppliers?.map((supplier: any) => (
                      <tr key={supplier.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{supplier.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{supplier.contactName || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{supplier.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <Badge variant={supplier.status === "active" ? "success" : "default"}>
                            {supplier.status || "active"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(supplier)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(supplier.id)}
                              disabled={deleteLoading === supplier.id}
                            >
                              {deleteLoading === supplier.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSupplier(null);
          }}
          title={editingSupplier ? "Edit Supplier" : "Create Supplier"}
        >
          <SupplierForm
            initialData={editingSupplier}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingSupplier(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </MainLayout>
  );
}

export default function SuppliersPage() {
  return (
    <ProtectedRoute>
      <SuppliersContent />
    </ProtectedRoute>
  );
}
