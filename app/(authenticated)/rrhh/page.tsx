"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEmployees, employeeApi } from "@/hooks/api/employees";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmployeesList } from "@/components/rrhh/EmployeesList";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { useToast } from "@/components/ui/Toast";
import { Plus } from "lucide-react";

function RRHHContent() {
  const { employees, isLoading, error, mutate } = useEmployees();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await employeeApi.create(data);
      await mutate();
      toast.success("Empleado creado correctamente");
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error("Error al crear empleado:", err);
      toast.error(err.message || "Error al crear el empleado");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando personal…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error al cargar el personal: {error.message || "Error desconocido"}
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
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Recursos Humanos</h1>
              <p className="text-gray-600">Gestión del personal de PMD</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Empleado
            </Button>
          </div>
        </div>

        <EmployeesList employees={employees || []} onRefresh={mutate} />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nuevo Empleado"
          size="lg"
        >
          <EmployeeForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </MainLayout>
  );
}

export default function RRHHPage() {
  return (
    <ProtectedRoute>
      <RRHHContent />
    </ProtectedRoute>
  );
}

