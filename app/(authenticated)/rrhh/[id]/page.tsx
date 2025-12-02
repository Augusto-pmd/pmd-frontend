"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEmployee, useEmployeeAssignments, employeeApi } from "@/hooks/api/employees";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { useToast } from "@/components/ui/Toast";
import { UserAvatar } from "@/components/settings/UserAvatar";
import { calcularEstadoSeguro, getBadgeColorSeguro } from "@/utils/seguro";
import { BotonVolver } from "@/components/ui/BotonVolver";

function EmployeeDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { employee, isLoading, error, mutate } = useEmployee(id);
  const { assignments, isLoading: assignmentsLoading } = useEmployeeAssignments(id);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const formatDate = (dateString: string | undefined): string => {
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

  const translateArea = (area: string | undefined): string => {
    if (!area) return "Sin área";
    const areaLower = area.toLowerCase();
    const translations: Record<string, string> = {
      arquitectura: "Arquitectura",
      architecture: "Arquitectura",
      obras: "Obras",
      works: "Obras",
      logistica: "Logística",
      logistics: "Logística",
      pañol: "Pañol",
      almacen: "Pañol",
      mantenimiento: "Mantenimiento",
      maintenance: "Mantenimiento",
      administracion: "Administración",
      administration: "Administración",
    };
    return translations[areaLower] || area;
  };

  const translateStatus = (status: string | undefined): string => {
    if (!status) return "Desconocido";
    const statusLower = status.toLowerCase();
    if (statusLower === "active" || statusLower === "activo") return "Activo";
    if (statusLower === "inactive" || statusLower === "inactivo") return "Inactivo";
    return status;
  };

  const getStatusVariant = (status: string | undefined): "success" | "error" | "default" => {
    if (!status) return "default";
    const statusLower = status.toLowerCase();
    if (statusLower === "active" || statusLower === "activo") return "success";
    if (statusLower === "inactive" || statusLower === "inactivo") return "error";
    return "default";
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando ficha del empleado…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar la ficha del empleado: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/rrhh")}>Volver a Recursos Humanos</Button>
        </div>
      </MainLayout>
    );
  }

  if (!employee) {
    return (
      <MainLayout>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-pmd">
          Empleado no encontrado
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/rrhh")}>Volver a Recursos Humanos</Button>
        </div>
      </MainLayout>
    );
  }

  const nombre = employee.nombre || employee.fullName || employee.name || "Sin nombre";
  const seguro = employee.seguro || employee.insurance;
  const fechaVencimiento = seguro?.fechaVencimiento || seguro?.expirationDate;
  const estadoSeguro = calcularEstadoSeguro(fechaVencimiento);

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await employeeApi.update(id, data);
      await mutate();
      toast.success("Empleado actualizado correctamente");
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Error al actualizar empleado:", err);
      toast.error(err.message || "Error al actualizar el empleado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      // Inactivar en lugar de eliminar físicamente
      await employeeApi.update(id, { isActive: false, status: "inactive", estado: "inactivo" });
      await mutate();
      toast.success("Empleado inactivado correctamente");
      setIsDeleteModalOpen(false);
      // Redirigir a la lista después de inactivar
      setTimeout(() => {
        router.push("/rrhh");
      }, 1500);
    } catch (err: any) {
      console.error("Error al inactivar empleado:", err);
      toast.error(err.message || "Error al inactivar el empleado");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <BotonVolver />
        </div>
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Ficha del empleado</h1>
            <p className="text-gray-600">Información completa del empleado seleccionado</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/rrhh")}>
            Volver a Recursos Humanos
          </Button>
        </div>

        {/* Información Personal */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <UserAvatar name={nombre} size="lg" />
              <div>
                <CardTitle className="text-2xl mb-2">{nombre}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={getStatusVariant(employee.estado || employee.status)}>
                    {translateStatus(employee.estado || employee.status)}
                  </Badge>
                  <Badge variant="info">
                    {translateArea(employee.area || employee.areaTrabajo)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Información Personal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField("Nombre completo", nombre)}
                {renderField("DNI", employee.dni || employee.DNI)}
                {renderField("Teléfono", employee.telefono || employee.phone || employee.telephone)}
                {renderField("Email", employee.email)}
                {renderField("Dirección", employee.direccion || employee.address || "No especificada")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Laboral */}
        <Card>
          <CardHeader>
            <CardTitle>Información Laboral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField("Área", translateArea(employee.area || employee.areaTrabajo))}
              {renderField("Puesto", employee.puesto || employee.position)}
              {renderField("Fecha de ingreso", employee.fechaIngreso || employee.startDate || employee.hireDate, formatDate)}
              {renderField("Estado", translateStatus(employee.estado || employee.status))}
            </div>
          </CardContent>
        </Card>

        {/* Seguro de Accidentes Personales */}
        <Card>
          <CardHeader>
            <CardTitle>Seguro de Accidentes Personales</CardTitle>
          </CardHeader>
          <CardContent>
            {seguro ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-pmd border-l-4 ${
                  estadoSeguro.color === "green" ? "bg-green-50 border-green-500" :
                  estadoSeguro.color === "yellow" ? "bg-yellow-50 border-yellow-500" :
                  "bg-red-50 border-red-500"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Estado del Seguro</h3>
                      <Badge variant={getBadgeColorSeguro(estadoSeguro.estado)} className="text-sm">
                        {estadoSeguro.texto}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {renderField("Compañía", seguro.compania || seguro.company)}
                  {renderField("Número de póliza", seguro.numeroPoliza || seguro.policyNumber)}
                  {renderField("Fecha de vencimiento", fechaVencimiento, formatDate)}
                  {renderField("Documento", "Disponible para descarga")}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No hay información de seguro registrada</p>
            )}
          </CardContent>
        </Card>

        {/* Asignaciones a Obras */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Asignaciones a Obras</CardTitle>
              <Button variant="outline" size="sm" onClick={() => alert("Funcionalidad próximamente disponible")}>
                Asignar a una obra
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {assignmentsLoading ? (
              <p className="text-gray-500">Cargando asignaciones…</p>
            ) : assignments && assignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Obra</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha inicio</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha fin</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rol</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assignments.map((assignment: any) => (
                      <tr key={assignment.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {assignment.obra?.nombre || assignment.work?.name || assignment.workId || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {assignment.fechaInicio || assignment.startDate ? formatDate(assignment.fechaInicio || assignment.startDate) : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {assignment.fechaFin || assignment.endDate ? formatDate(assignment.fechaFin || assignment.endDate) : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {assignment.rol || assignment.role || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={getStatusVariant(assignment.estado || assignment.status)}>
                            {translateStatus(assignment.estado || assignment.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No hay asignaciones registradas</p>
            )}
          </CardContent>
        </Card>

        {/* Documentación del Empleado */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Documentación del Empleado</CardTitle>
              <Button variant="outline" size="sm" onClick={() => alert("Funcionalidad próximamente disponible")}>
                Subir documento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No hay documentos registrados</p>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            Editar datos
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            Dar de baja
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Empleado"
        size="lg"
      >
        <EmployeeForm
          initialData={employee}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Inactivación"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas inactivar al empleado <strong>{nombre}</strong>?
          </p>
          <p className="text-sm text-gray-500">
            El empleado será marcado como inactivo. Esta acción se puede revertir editando el empleado.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Inactivando..." : "Inactivar"}
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}

export default function EmployeeDetailPage() {
  return (
    <ProtectedRoute>
      <EmployeeDetailContent />
    </ProtectedRoute>
  );
}

