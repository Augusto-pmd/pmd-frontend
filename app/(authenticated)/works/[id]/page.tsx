"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useWork, workApi } from "@/hooks/api/works";
import { useUsers } from "@/hooks/api/users";
import { useSuppliers } from "@/hooks/api/suppliers";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { WorkForm } from "@/components/forms/WorkForm";
import { useToast } from "@/components/ui/Toast";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Edit, Archive, Trash2, UserPlus, Building2, DollarSign, TrendingUp, TrendingDown, Lock } from "lucide-react";
import { parseBackendError } from "@/lib/parse-backend-error";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/lib/normalizeUser";

function WorkDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : null;
  const { work, isLoading, error, mutate } = useWork(id);
  const { users } = useUsers();
  const { suppliers } = useSuppliers();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const toast = useToast();
  const user = useAuthStore.getState().user;
  const isDirection = user?.role?.name === UserRole.DIRECTION;

  if (!id) return null;

  if (isLoading) {
    return (
      <LoadingState message="Cargando obra…" />
    );
  }

  if (error) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error al cargar la obra: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/works")}>Volver a Obras</Button>
        </div>
      </>
    );
  }

  if (!work) {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          Obra no encontrada
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/works")}>Volver a Obras</Button>
        </div>
      </>
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

  const isWorkClosed = () => {
    const status = getWorkStatus().toLowerCase();
    return status === "finished" || status === "finalizada" || 
           status === "administratively_closed" || status === "cerrada administrativamente" ||
           status === "archived" || status === "archivada";
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

  const formatCurrency = (amount: number | undefined, currency: string = work.currency || "ARS") => {
    if (amount === undefined || amount === null) return "$0.00";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await workApi.update(id, data);
      await mutate();
      toast.success("Obra actualizada correctamente");
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Error al actualizar obra:", err);
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    setIsSubmitting(true);
    try {
      await workApi.update(id, { 
        estado: "finalizada", 
        status: "completed",
        isActive: false 
      });
      await mutate();
      toast.success("Obra archivada correctamente");
      setIsDeleteModalOpen(false);
      setTimeout(() => {
        router.push("/works");
      }, 1500);
    } catch (err: any) {
      console.error("Error al archivar obra:", err);
      toast.error(err.message || "Error al archivar la obra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await workApi.delete(id);
      toast.success("Obra eliminada correctamente");
      setIsDeleteModalOpen(false);
      setTimeout(() => {
        router.push("/works");
      }, 1500);
    } catch (err: any) {
      console.error("Error al eliminar obra:", err);
      toast.error(err.message || "Error al eliminar la obra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!confirm(`¿Estás seguro de que quieres cerrar la obra "${getWorkName()}"? Una vez cerrada, no se podrán crear nuevos gastos (excepto para Dirección).`)) {
      return;
    }
    setIsClosing(true);
    try {
      await workApi.close(id);
      await mutate();
      toast.success("Obra cerrada correctamente");
    } catch (err: any) {
      console.error("Error al cerrar obra:", err);
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsClosing(false);
    }
  };

  // Obtener personal asignado a esta obra
  const assignedEmployees = users?.filter((emp: any) => {
    const assignments = emp.assignments || [];
    return assignments.some((assignment: any) => 
      assignment.workId === id || assignment.obraId === id
    );
  }) || [];

  // Obtener proveedores asignados (placeholder - ajustar según backend)
  const assignedSuppliers = suppliers?.filter((sup: any) => {
    return sup.workId === id || sup.obraId === id;
  }) || [];

  return (
    <>
      <div className="space-y-6">
        <div>
          <BotonVolver backTo="/works" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Detalle de la obra</h1>
            <p className="text-gray-600">Información completa de la obra seleccionada</p>
          </div>
          <div className="flex gap-2">
            {isDirection && !isWorkClosed() && (
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={isClosing}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <Lock className="h-4 w-4 mr-2" />
                {isClosing ? "Cerrando..." : "Cerrar Obra"}
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={() => router.push("/works")}>
              Volver a Obras
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{getWorkName()}</CardTitle>
              <div className="flex gap-2">
                {isWorkClosed() && (
                  <Badge variant="error" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Cerrada
                  </Badge>
                )}
                <Badge variant={getStatusVariant(getWorkStatus())}>
                  {getStatusLabel(getWorkStatus())}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Banner para obras cerradas */}
            {isWorkClosed() && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-900 mb-1">
                      Obra Cerrada
                    </p>
                    <p className="text-sm text-orange-700 mb-2">
                      Esta obra está cerrada. No se pueden crear nuevos gastos (excepto para Dirección).
                    </p>
                    {work.end_date && (
                      <p className="text-xs text-orange-600">
                        Fecha de cierre: {formatDate(work.end_date)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
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

              {work.fechaFin || work.endDate || work.end_date ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    {isWorkClosed() ? "Fecha de cierre" : "Fecha de fin"}
                  </h3>
                  <p className="text-gray-900">{formatDate(work.fechaFin || work.endDate || work.end_date)}</p>
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

        {/* Personal Asignado */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Personal Asignado</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Funcionalidad de asignación próximamente disponible")}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Asignar Personal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {assignedEmployees.length > 0 ? (
              <div className="space-y-2">
                {assignedEmployees.map((emp: any) => {
                  const nombre = emp.nombre || emp.fullName || emp.name || "Sin nombre";
                  const puesto = emp.puesto || emp.position || "";
                  return (
                    <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{nombre}</p>
                        {puesto && <p className="text-sm text-gray-500">{puesto}</p>}
                      </div>
                      <Badge variant="info">{emp.area || emp.areaTrabajo || ""}</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No hay personal asignado a esta obra</p>
            )}
          </CardContent>
        </Card>

        {/* Proveedores Asignados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Proveedores Asignados</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Funcionalidad de asignación próximamente disponible")}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Asignar Proveedor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {assignedSuppliers.length > 0 ? (
              <div className="space-y-2">
                {assignedSuppliers.map((sup: any) => {
                  const nombre = sup.nombre || sup.name || "Sin nombre";
                  const estado = sup.estado || sup.status || "";
                  return (
                    <div key={sup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{nombre}</p>
                        {sup.email && <p className="text-sm text-gray-500">{sup.email}</p>}
                      </div>
                      <Badge variant={estado === "aprobado" ? "success" : "warning"}>
                        {estado}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No hay proveedores asignados a esta obra</p>
            )}
          </CardContent>
        </Card>

        {/* Documentos de Obra */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Documentos de la Obra</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/works/${id}/documents`)}
              >
                Ver todos los documentos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm mb-4">
              Gestiona la documentación relacionada con esta obra
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/works/${id}/documents`)}
            >
              Ver Documentos
            </Button>
          </CardContent>
        </Card>

        {/* Alertas de la Obra */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alertas de la Obra</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/alerts?workId=${id}`)}
              >
                Ver todas las alertas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm mb-4">
              Revisa las alertas y notificaciones relacionadas con esta obra
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/alerts?workId=${id}`)}
            >
              Ver Alertas
            </Button>
          </CardContent>
        </Card>

        {/* Contabilidad de la Obra */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contabilidad de la Obra</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/accounting?workId=${id}`)}
              >
                Ver movimientos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm mb-4">
              Revisa los movimientos contables relacionados con esta obra
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/accounting?workId=${id}`)}
            >
              Ver Contabilidad
            </Button>
          </CardContent>
        </Card>

        {/* Cajas de la Obra */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cajas de la Obra</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/cashbox?workId=${id}`)}
              >
                Ver cajas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm mb-4">
              Gestiona las cajas de efectivo relacionadas con esta obra
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/cashbox?workId=${id}`)}
            >
              Ver Cajas
            </Button>
          </CardContent>
        </Card>

        {/* Resumen Económico */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Resumen Económico</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Totales actualizados automáticamente al validar gastos e ingresos
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Presupuesto */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-medium text-gray-700">Presupuesto</p>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(work.total_budget || work.presupuesto || work.budget, work.currency)}
                </p>
              </div>

              {/* Total Gastos */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <p className="text-sm font-medium text-gray-700">Total Gastos</p>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {formatCurrency(work.total_expenses, work.currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Gastos validados</p>
              </div>

              {/* Total Ingresos */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-gray-700">Total Ingresos</p>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(work.total_incomes, work.currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ingresos validados</p>
              </div>

              {/* Rentabilidad */}
              <div className={`p-4 rounded-lg border ${
                ((work.total_incomes || 0) - (work.total_expenses || 0)) >= 0
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className={`h-5 w-5 ${
                    ((work.total_incomes || 0) - (work.total_expenses || 0)) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`} />
                  <p className="text-sm font-medium text-gray-700">Rentabilidad</p>
                </div>
                <p className={`text-2xl font-bold ${
                  ((work.total_incomes || 0) - (work.total_expenses || 0)) >= 0
                    ? "text-green-900"
                    : "text-red-900"
                }`}>
                  {formatCurrency((work.total_incomes || 0) - (work.total_expenses || 0), work.currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((work.total_incomes || 0) - (work.total_expenses || 0)) >= 0 ? "Ganancia" : "Pérdida"}
                </p>
              </div>
            </div>

            {/* Indicador de progreso económico */}
            {work.total_budget && work.total_budget > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Progreso Económico</p>
                  <p className="text-sm text-gray-500">
                    {((work.total_expenses || 0) / work.total_budget * 100).toFixed(1)}% del presupuesto utilizado
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      ((work.total_expenses || 0) / work.total_budget) > 1
                        ? "bg-red-600"
                        : ((work.total_expenses || 0) / work.total_budget) > 0.8
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(((work.total_expenses || 0) / work.total_budget) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Presupuesto restante: {formatCurrency(Math.max(0, work.total_budget - (work.total_expenses || 0)), work.currency)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dashboard por Obra */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard de la Obra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Personal Asignado</p>
                <p className="text-2xl font-bold text-blue-700">{assignedEmployees.length}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Proveedores</p>
                <p className="text-2xl font-bold text-yellow-700">{assignedSuppliers.length}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Estado</p>
                <Badge variant={getStatusVariant(getWorkStatus())} className="mt-2">
                  {getStatusLabel(getWorkStatus())}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Obra
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archivar / Eliminar
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Obra"
        size="lg"
      >
        <WorkForm
          initialData={work}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Acción"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Qué acción deseas realizar con la obra <strong>{getWorkName()}</strong>?
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleArchive}
              disabled={isSubmitting}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archivar (marcar como finalizada)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:border-red-300"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar permanentemente
            </Button>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function WorkDetailPage() {
  return (
    <ProtectedRoute>
      <WorkDetailContent />
    </ProtectedRoute>
  );
}

