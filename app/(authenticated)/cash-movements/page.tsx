"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCashMovements } from "@/hooks/api/cashboxes";
import { LoadingState } from "@/components/ui/LoadingState";
import { MovementsList } from "@/components/cashMovements/MovementsList";
import { BotonVolver } from "@/components/ui/BotonVolver";

function CashMovementsContent() {
  const { movements, isLoading, error } = useCashMovements();

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando movimientos…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar los movimientos: {error.message || "Error desconocido"}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Movimientos de Caja</h1>
          <p className="text-gray-600">Registro de ingresos y egresos</p>
        </div>

        <MovementsList movements={movements || []} />
      </div>
    </MainLayout>
  );
}

export default function CashMovementsPage() {
  return (
    <ProtectedRoute>
      <CashMovementsContent />
    </ProtectedRoute>
  );
}

