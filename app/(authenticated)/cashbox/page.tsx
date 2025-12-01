"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCashboxes, useCashMovements, cashboxApi, cashMovementApi } from "@/hooks/api/cashboxes";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BotonVolver } from "@/components/ui/BotonVolver";

function CashboxContent() {
  const { cashboxes, isLoading, error } = useCashboxes();
  const primaryCashbox = cashboxes?.[0];
  const { movements, isLoading: movementsLoading } = useCashMovements(primaryCashbox?.id);

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando caja…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar la caja: {error.message || "Error desconocido"}
        </div>
      </MainLayout>
    );
  }

  const balance = primaryCashbox?.balance || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <BotonVolver />
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Caja</h1>
          <p className="text-gray-600">Gestión de transacciones y saldos de caja</p>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6">
            <div className="bg-gray-50 rounded-pmd p-6">
              <p className="text-sm text-gray-600 mb-2">Saldo Actual de Caja</p>
              <p className="text-3xl font-bold text-pmd-darkBlue">${balance.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Transacciones Recientes</h2>
            {movementsLoading ? (
              <LoadingState message="Cargando transacciones…" />
            ) : movements?.length === 0 ? (
              <EmptyState
                title="No hay transacciones aún"
                description="Las transacciones aparecerán aquí una vez que comiences a registrar movimientos de caja"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {movements?.slice(0, 10).map((movement: any) => (
                      <tr key={movement.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {movement.date ? new Date(movement.date).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <Badge variant={movement.type === "income" ? "success" : "error"}>
                            {movement.type === "income" ? "Ingreso" : movement.type === "expense" ? "Egreso" : movement.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{movement.description || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                          ${movement.amount?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <Badge variant={movement.status === "completed" ? "success" : "warning"}>
                            {movement.status === "completed" ? "Completado" : movement.status === "pending" ? "Pendiente" : movement.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function CashboxPage() {
  return (
    <ProtectedRoute>
      <CashboxContent />
    </ProtectedRoute>
  );
}
