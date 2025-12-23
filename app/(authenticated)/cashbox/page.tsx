"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCashboxStore } from "@/store/cashboxStore";
import { useWorks } from "@/hooks/api/works";
import { useAuthStore } from "@/store/authStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { CashboxForm } from "./components/CashboxForm";
import { useToast } from "@/components/ui/Toast";

function CashboxContent() {
  const router = useRouter();
  const { cashboxes, isLoading, error, fetchCashboxes, closeCashbox } = useCashboxStore();
  const { works } = useWorks();
  const user = useAuthStore.getState().user;
  const [showForm, setShowForm] = useState(false);
  const [editingCashbox, setEditingCashbox] = useState<any>(null);
  const toast = useToast();
  const organizationId = (user as any)?.organizationId || (user as any)?.organization?.id;

  useEffect(() => {
    if (organizationId) {
      fetchCashboxes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  if (!organizationId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold mb-2">No se pudo determinar la organización</p>
        <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
      </div>
    );
  }

  if (isLoading && cashboxes.length === 0) {
    return <LoadingState message="Cargando cajas..." />;
  }

  const handleCloseCashbox = async (id: string) => {
    if (!confirm("¿Estás seguro de cerrar esta caja? No se podrán agregar más movimientos.")) {
      return;
    }

    try {
      await closeCashbox(id);
      toast.success("Caja cerrada correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al cerrar la caja");
    }
  };

  const getWorkName = (workId?: string) => {
    if (!workId) return "Sin obra asignada";
    const work = works?.find((w: any) => w.id === workId);
    return work?.title || work?.name || work?.nombre || `Obra ${workId.slice(0, 8)}`;
  };

  const calculateTotalMovements = (cashbox: any) => {
    // Esto se calculará mejor cuando tengamos los movimientos cargados
    // Por ahora retornamos el balance si existe
    return cashbox.balance || 0;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Obtener el rol del usuario para mostrar mensajes específicos
  const getUserRole = (): string | null => {
    if (!user) return null;
    if (user.role?.name) return user.role.name.toUpperCase();
    return null;
  };

  const isOperator = getUserRole() === "OPERATOR";
  const isDirection = getUserRole() === "DIRECTION";
  const isAdministration = getUserRole() === "ADMINISTRATION";
  const isSupervisor = getUserRole() === "SUPERVISOR";

  // Determinar el mensaje apropiado cuando no hay cajas
  const getEmptyStateMessage = () => {
    if (isOperator) {
      return {
        title: "No tienes cajas asignadas",
        description: "Como operador, solo puedes ver las cajas que te han sido asignadas. Si necesitas una caja, contacta con un supervisor o administrador.",
        showAction: false,
      };
    }
    return {
      title: "No hay cajas registradas",
      description: "Crea tu primera caja para comenzar a gestionar el flujo de efectivo",
      showAction: true,
    };
  };

  const emptyStateMessage = getEmptyStateMessage();

  return (
    <div className="space-y-6">
        <div>
          <BotonVolver />
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Cajas</h1>
              <p className="text-gray-600">Gestión de flujo de efectivo y cajas del sistema PMD</p>
            </div>
            {/* Solo mostrar botón de crear caja si el usuario tiene permisos (no Operator) */}
            {!isOperator && (
              <Button
                variant="primary"
                onClick={() => {
                  setEditingCashbox(null);
                  setShowForm(true);
                }}
              >
                Abrir nueva caja
              </Button>
            )}
          </div>
        </div>

        {showForm && (
          <CashboxForm
            onSuccess={() => {
              setShowForm(false);
              setEditingCashbox(null);
              fetchCashboxes();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingCashbox(null);
            }}
          />
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!showForm && (
          <>
            {cashboxes.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <EmptyState
                    title={emptyStateMessage.title}
                    description={emptyStateMessage.description}
                    action={
                      emptyStateMessage.showAction ? (
                        <Button variant="primary" onClick={() => setShowForm(true)}>
                          Crear primera caja
                        </Button>
                      ) : undefined
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Nombre de caja
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Obra asignada
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Fecha de apertura
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Fecha de cierre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Total movimientos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cashboxes.map((cashbox) => {
                        const isClosed = cashbox.isClosed || cashbox.closedAt;
                        return (
                          <tr key={cashbox.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {`Caja ${cashbox.id.slice(0, 8)}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {(cashbox as any).workId ? getWorkName((cashbox as any).workId) : "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(cashbox.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={isClosed ? "default" : "success"}>
                                {isClosed ? "Cerrada" : "Abierta"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {cashbox.closedAt ? formatDate(cashbox.closedAt) : "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                ${calculateTotalMovements(cashbox).toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/cashbox/${cashbox.id}`)}
                                >
                                  Ver
                                </Button>
                                {!isClosed && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCloseCashbox(cashbox.id)}
                                  >
                                    Cerrar
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
  );
}

export default function CashboxPage() {
  return (
    <ProtectedRoute>
      <CashboxContent />
    </ProtectedRoute>
  );
}
