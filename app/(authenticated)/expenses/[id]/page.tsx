"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useExpense } from "@/hooks/api/expenses";
import { useContract } from "@/hooks/api/contracts";
import { useAlertsStore } from "@/store/alertsStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { useToast } from "@/components/ui/Toast";
import { Receipt, FileCheck, AlertCircle, FileText } from "lucide-react";

function ExpenseDetailContent() {
  const params = useParams();
  const router = useRouter();
  const expenseId = typeof params?.id === "string" ? params.id : null;
  const { expense, isLoading, error, mutate } = useExpense(expenseId);
  const { alerts, fetchAlerts } = useAlertsStore();
  const toast = useToast();

  // Obtener contrato si existe
  const contractId = expense?.contract_id;
  const { contract, mutate: mutateContract } = useContract(contractId || null);

  useEffect(() => {
    if (expenseId) {
      fetchAlerts();
    }
  }, [expenseId, fetchAlerts]);

  // Refrescar contrato cuando cambia el estado del gasto (para mostrar saldo actualizado)
  useEffect(() => {
    if (contractId && expense?.state) {
      mutateContract();
    }
  }, [expense?.state, contractId, mutateContract]);

  if (!expenseId) {
    return null;
  }

  if (isLoading) {
    return <LoadingState message="Cargando gasto..." />;
  }

  if (error) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error al cargar el gasto: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/expenses")}>Volver a Gastos</Button>
        </div>
      </>
    );
  }

  if (!expense) {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          Gasto no encontrado
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/expenses")}>Volver a Gastos</Button>
        </div>
      </>
    );
  }

  // Filtrar alertas relacionadas con este gasto
  const expenseAlerts = alerts.filter(
    (alert) => alert.expense_id === expenseId || alert.contract_id === contractId
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: expense.currency || "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
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

  const getStateBadgeVariant = (state?: string) => {
    if (!state) return "default";
    const stateLower = state.toLowerCase();
    if (stateLower === "validated") return "success";
    if (stateLower === "observed") return "warning";
    if (stateLower === "annulled") return "error";
    return "default";
  };

  const getStateLabel = (state?: string) => {
    if (!state) return "Pendiente";
    const stateLower = state.toLowerCase();
    if (stateLower === "validated") return "Validado";
    if (stateLower === "observed") return "Observado";
    if (stateLower === "annulled") return "Anulado";
    return state;
  };

  // Función para renderizar un campo si existe (patrón del sistema)
  const renderField = (label: string, value: any, formatter?: (val: any) => string, icon?: React.ReactNode) => {
    if (value === null || value === undefined || value === "") return null;
    return (
      <div className="flex items-start gap-3">
        {icon || <div className="h-5 w-5 mt-0.5" />}
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-base font-medium text-gray-900">{formatter ? formatter(value) : String(value)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <BotonVolver backTo="/expenses" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Detalle del gasto</h1>
          <p className="text-gray-600">Información completa del gasto seleccionado</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/expenses")}>
          Volver a Gastos
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{expense.description || "Gasto sin descripción"}</CardTitle>
            <Badge variant={getStateBadgeVariant(expense.state || expense.estado)}>
              {getStateLabel(expense.state || expense.estado)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField("Descripción", expense.description, undefined, <Receipt className="h-5 w-5 text-gray-400" />)}
            {renderField("Monto", expense.amount, formatCurrency)}
            {renderField("Fecha de compra", expense.purchase_date || expense.date, formatDate)}
            {renderField("Categoría", expense.category)}
            {renderField("Tipo de documento", expense.document_type)}
            {renderField("Número de documento", expense.document_number)}
            {renderField("Moneda", expense.currency)}
            {renderField("Fecha de creación", expense.createdAt || expense.created_at, formatDate)}
            {renderField("Última actualización", expense.updatedAt || expense.updated_at, formatDate)}
          </div>
          
          {/* Sección especial para VAL generado automáticamente */}
          {expense.document_type === "VAL" && expense.document_number && (
            <div className="pt-4 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Código VAL Generado Automáticamente</p>
                    <p className="text-xs text-blue-700 mb-2">
                      Este código VAL fue generado automáticamente por el sistema al crear el gasto.
                    </p>
                    <div className="bg-white rounded-md px-3 py-2 border border-blue-300">
                      <p className="text-lg font-mono font-bold text-blue-900">{expense.document_number}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información del contrato */}
      {contractId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Contrato Asignado</CardTitle>
              {contract?.is_blocked && (
                <Badge variant="error">Bloqueado</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mensaje informativo si el gasto fue observado o anulado */}
            {(expense.state === "observed" || expense.state === "annulled" || expense.estado === "observed" || expense.estado === "annulled") && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Saldo del contrato revertido
                    </p>
                    <p className="text-sm text-blue-700">
                      {expense.state === "annulled" || expense.estado === "annulled"
                        ? "Al anular este gasto, el saldo del contrato se ha revertido automáticamente."
                        : "Al observar este gasto, el saldo del contrato se ha revertido automáticamente."}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {contract ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField(
                  "Número de contrato",
                  contract.contract_number || contract.number || `Contrato ${contractId.slice(0, 8)}`,
                  undefined,
                  <FileCheck className="h-5 w-5 text-gray-400" />
                )}
                {renderField("Proveedor", contract.supplier?.name || contract.supplierName)}
                {renderField("Monto total", contract.amount_total, formatCurrency)}
                {renderField("Monto ejecutado", contract.amount_executed, formatCurrency)}
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Saldo disponible</p>
                    <p
                      className={`text-lg font-semibold ${
                        (contract.amount_total || 0) - (contract.amount_executed || 0) < 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(
                        (contract.amount_total || 0) - (contract.amount_executed || 0)
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Actualizado automáticamente
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600">Cargando información del contrato...</p>
              </div>
            )}
            {contract && (
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/contracts/${contractId}`)}
                >
                  Ver contrato completo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alertas relacionadas */}
      {expenseAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Alertas</CardTitle>
              <Badge variant="info">{expenseAlerts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.severity === "critical"
                      ? "bg-red-50 border-red-200"
                      : alert.severity === "warning"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle
                      className={`h-4 w-4 ${
                        alert.severity === "critical"
                          ? "text-red-600"
                          : alert.severity === "warning"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    />
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "error"
                          : alert.severity === "warning"
                          ? "warning"
                          : "info"
                      }
                    >
                      {alert.severity === "critical"
                        ? "Crítico"
                        : alert.severity === "warning"
                        ? "Advertencia"
                        : "Info"}
                    </Badge>
                    {!alert.read && (
                      <Badge variant="info" style={{ fontSize: "10px" }}>
                        Nuevo
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{alert.title}</h4>
                  <p className="text-sm text-gray-700">{alert.message}</p>
                  {alert.createdAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(alert.createdAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ExpenseDetailPage() {
  return (
    <ProtectedRoute>
      <ExpenseDetailContent />
    </ProtectedRoute>
  );
}

