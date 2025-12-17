"use client";

import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCashMovement } from "@/hooks/api/cashboxes";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BotonVolver } from "@/components/ui/BotonVolver";

function CashMovementDetailContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  const router = useRouter();
  
  // Safely extract id from params
  const id = typeof params?.id === "string" ? params.id : null;
  
  const { movement, isLoading, error } = useCashMovement(id || "");

  // Guard check after all hooks
  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando movimiento…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar el movimiento: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/cash-movements")}>Volver a Movimientos de Caja</Button>
        </div>
      </MainLayout>
    );
  }

  if (!movement) {
    return (
      <MainLayout>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-pmd">
          Movimiento no encontrado
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/cash-movements")}>Volver a Movimientos de Caja</Button>
        </div>
      </MainLayout>
    );
  }

  const getMovementType = () => {
    return movement.tipo || movement.type || "egreso";
  };

  const getTypeVariant = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower === "ingreso" || typeLower === "income") return "success";
    if (typeLower === "egreso" || typeLower === "expense") return "error";
    return "default";
  };

  const getTypeLabel = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower === "income") return "Ingreso";
    if (typeLower === "expense") return "Egreso";
    return type;
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === null || amount === undefined) return "No especificado";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getCashboxName = () => {
    if (movement.cashbox) {
      return movement.cashbox.nombre || movement.cashbox.name || "Caja";
    }
    return movement.cashboxId ? `Caja ${movement.cashboxId.slice(0, 8)}` : "Sin caja";
  };

  const getUserName = () => {
    if (movement.user) {
      return movement.user.nombre || movement.user.fullName || movement.user.name || "Usuario";
    }
    return movement.userId ? `Usuario ${movement.userId.slice(0, 8)}` : null;
  };

  const type = getMovementType();
  const isIncome = type.toLowerCase() === "ingreso" || type.toLowerCase() === "income";
  const amount = movement.monto || movement.amount || 0;

  // Función para renderizar un campo si existe
  const renderField = (label: string, value: any, formatter?: (val: any) => string) => {
    if (value === null || value === undefined || value === "") return null;
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{label}</h3>
        <p className="text-gray-900">{formatter ? formatter(value) : String(value)}</p>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver backTo="/cash-movements" />
        </div>
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Detalle del movimiento</h1>
            <p className="text-gray-600">Información completa del movimiento seleccionado</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/cash-movements")}>
            Volver a Movimientos de Caja
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {movement.concepto || movement.descripcion || movement.description || "Movimiento"}
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge variant={getTypeVariant(type)}>{getTypeLabel(type)}</Badge>
                <span
                  className={`text-2xl font-bold ${
                    isIncome ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isIncome ? "+" : "-"} {formatCurrency(Math.abs(amount))}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField("Tipo", getTypeLabel(type))}
              {renderField("Monto", amount, formatCurrency)}
              {renderField("Fecha", movement.fecha || movement.date, formatDate)}
              {renderField("Concepto", movement.concepto || movement.descripcion || movement.description)}
              {renderField("Caja asociada", getCashboxName())}
              {getUserName() && renderField("Usuario que registró", getUserName())}
            </div>

            {/* Mostrar campos adicionales si existen */}
            {Object.keys(movement).some(
              (key) =>
                ![
                  "id",
                  "tipo",
                  "type",
                  "monto",
                  "amount",
                  "fecha",
                  "date",
                  "concepto",
                  "descripcion",
                  "description",
                  "cashboxId",
                  "cashbox",
                  "userId",
                  "user",
                  "createdAt",
                  "updatedAt",
                ].includes(key) &&
                movement[key] !== null &&
                movement[key] !== undefined &&
                movement[key] !== ""
            ) && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Información adicional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(movement)
                    .filter(
                      (key) =>
                        ![
                          "id",
                          "tipo",
                          "type",
                          "monto",
                          "amount",
                          "fecha",
                          "date",
                          "concepto",
                          "descripcion",
                          "description",
                          "cashboxId",
                          "cashbox",
                          "userId",
                          "user",
                          "createdAt",
                          "updatedAt",
                        ].includes(key) &&
                        movement[key] !== null &&
                        movement[key] !== undefined &&
                        movement[key] !== ""
                    )
                    .map((key) => (
                      <div key={key}>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </h3>
                        <p className="text-gray-900">
                          {typeof movement[key] === "object"
                            ? JSON.stringify(movement[key])
                            : String(movement[key])}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {movement.createdAt && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Fecha de creación</h3>
                <p className="text-gray-900">{formatDate(movement.createdAt)}</p>
              </div>
            )}

            {movement.id && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">ID del movimiento</h3>
                <p className="text-gray-600 font-mono text-sm">{movement.id}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default function CashMovementDetailPage() {
  return (
    <ProtectedRoute>
      <CashMovementDetailContent />
    </ProtectedRoute>
  );
}

