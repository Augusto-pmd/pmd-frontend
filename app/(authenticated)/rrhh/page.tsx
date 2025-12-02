"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEmployees } from "@/hooks/api/employees";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmployeesList } from "@/components/rrhh/EmployeesList";
import { BotonVolver } from "@/components/ui/BotonVolver";

function RRHHContent() {
  const { employees, isLoading, error } = useEmployees();

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
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
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Recursos Humanos</h1>
          <p className="text-gray-600">Gestión del personal de PMD</p>
        </div>

        <EmployeesList employees={employees || []} />
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

