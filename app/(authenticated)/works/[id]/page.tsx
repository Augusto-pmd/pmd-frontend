"use client";

import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useWork } from "@/hooks/api/works";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function WorkDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { work, isLoading, error } = useWork(id);

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando obra…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar la obra: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/works")}>Volver a Obras</Button>
        </div>
      </MainLayout>
    );
  }

  if (!work) {
    return (
      <MainLayout>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-pmd">
          Obra no encontrada
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/works")}>Volver a Obras</Button>
        </div>
      </MainLayout>
    );
  }

  const getWorkName = () => {
    return work.nombre || work.name || work.title || "Sin nombre";
  };

  const getWorkDescription = () => {
    return work.descripcion || work.description || "";
  };

  const getWorkStatus = () => {
    return work.estado || work.status || "pendiente";
  };

  const getStatusVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completada" || statusLower === "completed") return "success";
    if (statusLower === "activa" || statusLower === "active") return "info";
    if (statusLower === "pendiente" || statusLower === "pending") return "warning";
    return "default";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completed") return "Completada";
    if (statusLower === "active") return "Activa";
    if (statusLower === "pending") return "Pendiente";
    return status;
  };

  const formatDate = (dateString: string | undefined) => {
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

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "No especificado";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Detalle de la obra</h1>
            <p className="text-gray-600">Información completa de la obra seleccionada</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/works")}>
            Volver a Obras
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{getWorkName()}</CardTitle>
              <Badge variant={getStatusVariant(getWorkStatus())}>
                {getStatusLabel(getWorkStatus())}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {getWorkDescription() && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
                <p className="text-gray-600">{getWorkDescription()}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {work.cliente || work.client ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Cliente</h3>
                  <p className="text-gray-900">{work.cliente || work.client}</p>
                </div>
              ) : null}

              {work.fechaInicio || work.startDate || work.estimatedStartDate ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Fecha de inicio estimada
                  </h3>
                  <p className="text-gray-900">
                    {formatDate(work.fechaInicio || work.startDate || work.estimatedStartDate)}
                  </p>
                </div>
              ) : null}

              {work.fechaFin || work.endDate ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Fecha de fin</h3>
                  <p className="text-gray-900">{formatDate(work.fechaFin || work.endDate)}</p>
                </div>
              ) : null}

              {work.presupuesto || work.budget ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Presupuesto</h3>
                  <p className="text-gray-900">
                    {formatCurrency(work.presupuesto || work.budget)}
                  </p>
                </div>
              ) : null}

              {work.createdAt ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Fecha de creación</h3>
                  <p className="text-gray-900">{formatDate(work.createdAt)}</p>
                </div>
              ) : null}

              {work.updatedAt ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Última actualización</h3>
                  <p className="text-gray-900">{formatDate(work.updatedAt)}</p>
                </div>
              ) : null}
            </div>

            {work.id && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">ID de la obra</h3>
                <p className="text-gray-600 font-mono text-sm">{work.id}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default function WorkDetailPage() {
  return (
    <ProtectedRoute>
      <WorkDetailContent />
    </ProtectedRoute>
  );
}

