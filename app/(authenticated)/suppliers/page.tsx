"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSuppliers } from "@/hooks/api/suppliers";
import { LoadingState } from "@/components/ui/LoadingState";
import { SuppliersList } from "@/components/suppliers/SuppliersList";
import { BotonVolver } from "@/components/ui/BotonVolver";

function SuppliersContent() {
  const { suppliers, isLoading, error } = useSuppliers();

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
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
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Proveedores</h1>
          <p className="text-gray-600">Listado de proveedores registrados en PMD</p>
        </div>

        <SuppliersList suppliers={suppliers || []} />
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
