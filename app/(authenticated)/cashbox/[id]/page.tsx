"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCashboxStore, CashMovement } from "@/store/cashboxStore";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useAuthStore } from "@/store/authStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { MovementForm } from "../components/MovementForm";
import { useToast } from "@/components/ui/Toast";

function CashboxDetailContent() {
  const params = useParams();
  const router = useRouter();
  const cashboxId = params.id as string;
  
  const { cashboxes, movements, isLoading, error, fetchCashboxes, fetchMovements, closeCashbox, deleteMovement } = useCashboxStore();
  const { suppliers } = useSuppliers();
  const { getUserSafe } = useAuthStore();
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [editingMovement, setEditingMovement] = useState<CashMovement | null>(null);
  const toast = useToast();

  const user = getUserSafe();
  const organizationId = (user as any)?.organizationId || (user as any)?.organization?.id;

  const cashbox = cashboxes.find((c) => c.id === cashboxId);
  const cashboxMovements = movements[cashboxId] || [];

  useEffect(() => {
    if (organizationId) {
      fetchCashboxes();
    }
  }, [organizationId, fetchCashboxes]);

  useEffect(() => {
    if (cashboxId && organizationId) {
      fetchMovements(cashboxId);
    }
  }, [cashboxId, organizationId, fetchMovements]);

  if (!organizationId) {
    return (
      <MainLayout>
        <LoadingState message="Cargando organización..." />
      </MainLayout>
    );
  }

  if (isLoading && !cashbox) {
    return (
      <MainLayout>
        <LoadingState message="Cargando caja..." />
      </MainLayout>
    );
  }

  if (!cashbox) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Caja no encontrada
        </div>
      </MainLayout>
    );
  }

  const isClosed = cashbox.isClosed || cashbox.closedAt;

  const handleCloseCashbox = async () => {
    if (!confirm("¿Estás seguro de cerrar esta caja? No se podrán agregar más movimientos.")) {
      return;
    }

    try {
      await closeCashbox(cashboxId);
      toast.success("Caja cerrada correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al cerrar la caja");
    }
  };

  const handleDeleteMovement = async (movementId: string) => {
    if (!confirm("¿Estás seguro de eliminar este movimiento?")) {
      return;
    }

    try {
      await deleteMovement(cashboxId, movementId);
      toast.success("Movimiento eliminado");
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar movimiento");
    }
  };

  const handleEditMovement = (movement: CashMovement) => {
    setEditingMovement(movement);
    setShowMovementForm(true);
  };

  const calculateBalance = () => {
    return cashboxMovements.reduce((total, movement) => {
      const type = movement.type === "ingreso" || movement.type === "income" ? "ingreso" : "egreso";
      const amount = movement.amount || 0;
      return type === "ingreso" ? total + amount : total - amount;
    }, 0);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return "-";
    const supplier = suppliers?.find((s: any) => s.id === supplierId);
    return supplier?.name || supplier?.nombre || `Proveedor ${supplierId.slice(0, 8)}`;
  };

  const getMovementTypeLabel = (type: string) => {
    if (type === "ingreso" || type === "income") return "Ingreso";
    if (type === "egreso" || type === "expense") return "Egreso";
    return type;
  };

  const getMovementTypeVariant = (type: string) => {
    if (type === "ingreso" || type === "income") return "success";
    if (type === "egreso" || type === "expense") return "error";
    return "default";
  };

  const balance = calculateBalance();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <BotonVolver />
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">
                {cashbox.name || `Caja ${cashbox.id.slice(0, 8)}`}
              </h1>
              <p className="text-gray-600">Gestión de movimientos de caja</p>
            </div>
            <div className="flex gap-2">
              {!isClosed && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingMovement(null);
                      setShowMovementForm(true);
                    }}
                  >
                    Nuevo movimiento
                  </Button>
                  <Button variant="outline" onClick={handleCloseCashbox}>
                    Cerrar caja
                  </Button>
                </>
              )}
              <Button variant="outline" disabled className="opacity-50">
                Registrar en contabilidad
              </Button>
            </div>
          </div>
        </div>

        {/* Resumen de caja */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Estado</div>
              <Badge variant={isClosed ? "default" : "success"} className="text-base">
                {isClosed ? "Cerrada" : "Abierta"}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Saldo actual</div>
              <div className="text-2xl font-bold text-pmd-darkBlue">
                ${balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 mb-1">Total movimientos</div>
              <div className="text-2xl font-bold text-pmd-darkBlue">
                {cashboxMovements.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {showMovementForm && (
          <MovementForm
            cashboxId={cashboxId}
            initialData={editingMovement}
            onSuccess={() => {
              setShowMovementForm(false);
              setEditingMovement(null);
              fetchMovements(cashboxId);
            }}
            onCancel={() => {
              setShowMovementForm(false);
              setEditingMovement(null);
            }}
          />
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
            {error}
          </div>
        )}

        {!showMovementForm && (
          <Card>
            <CardHeader>
              <CardTitle>Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && cashboxMovements.length === 0 ? (
                <LoadingState message="Cargando movimientos..." />
              ) : cashboxMovements.length === 0 ? (
                <EmptyState
                  title="No hay movimientos registrados"
                  description={isClosed ? "Esta caja está cerrada y no tiene movimientos" : "Agrega el primer movimiento para comenzar"}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Monto</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Proveedor</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notas</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cashboxMovements.map((movement) => (
                        <tr key={movement.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDate(movement.date)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={getMovementTypeVariant(movement.type)}>
                              {getMovementTypeLabel(movement.type)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            ${(movement.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {movement.category || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {getSupplierName(movement.supplierId)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {movement.notes || movement.description || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {!isClosed && (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditMovement(movement)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteMovement(movement.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Eliminar
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

export default function CashboxDetailPage() {
  return (
    <ProtectedRoute>
      <CashboxDetailContent />
    </ProtectedRoute>
  );
}

