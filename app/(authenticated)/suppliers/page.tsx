"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSuppliers, supplierApi } from "@/hooks/api/suppliers";
import { LoadingState } from "@/components/ui/LoadingState";
import { SuppliersList } from "@/components/suppliers/SuppliersList";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SupplierForm } from "@/components/forms/SupplierForm";
import { useToast } from "@/components/ui/Toast";
import { Plus } from "lucide-react";

function SuppliersContent() {
  const { suppliers, isLoading, error, mutate } = useSuppliers();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await supplierApi.create(data);
      await mutate();
      toast.success("Proveedor creado correctamente");
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error("Error al crear proveedor:", err);
      toast.error(err.message || "Error al crear el proveedor");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando proveedores…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error al cargar los proveedores: {error.message || "Error desconocido"}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Proveedores</h1>
              <p className="text-gray-600">Listado de proveedores registrados en PMD</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Proveedor
            </Button>
          </div>
        </div>

        <SuppliersList suppliers={suppliers || []} onRefresh={mutate} />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nuevo Proveedor"
          size="lg"
        >
          <SupplierForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
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
