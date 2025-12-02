"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { employeeApi } from "@/hooks/api/employees";
import { useToast } from "@/components/ui/Toast";
import { UserAvatar } from "@/components/settings/UserAvatar";
import { calcularEstadoSeguro, getBadgeColorSeguro } from "@/utils/seguro";
import { Edit, Trash2, Eye } from "lucide-react";

interface Employee {
  id: string;
  fullName?: string;
  nombre?: string;
  name?: string;
  area?: string;
  areaTrabajo?: string;
  puesto?: string;
  position?: string;
  status?: string;
  estado?: string;
  seguro?: {
    fechaVencimiento?: string;
    expirationDate?: string;
    company?: string;
    compania?: string;
    policyNumber?: string;
    numeroPoliza?: string;
  };
  insurance?: {
    fechaVencimiento?: string;
    expirationDate?: string;
    company?: string;
    compania?: string;
    policyNumber?: string;
    numeroPoliza?: string;
  };
  [key: string]: any;
}

interface EmployeeCardProps {
  employee: Employee;
  onRefresh?: () => void;
}

export function EmployeeCard({ employee, onRefresh }: EmployeeCardProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

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

  const nombre = employee.nombre || employee.fullName || employee.name || "Sin nombre";
  const area = employee.area || employee.areaTrabajo || "";
  const puesto = employee.puesto || employee.position || "Sin puesto";
  const status = employee.estado || employee.status || "";
  const seguro = employee.seguro || employee.insurance;
  const fechaVencimiento = seguro?.fechaVencimiento || seguro?.expirationDate;
  const estadoSeguro = calcularEstadoSeguro(fechaVencimiento);

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await employeeApi.update(employee.id, data);
      await onRefresh?.();
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
      await employeeApi.update(employee.id, { isActive: false, status: "inactive", estado: "inactivo" });
      await onRefresh?.();
      toast.success("Empleado inactivado correctamente");
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      console.error("Error al inactivar empleado:", err);
      toast.error(err.message || "Error al inactivar el empleado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-pmd-darkBlue">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <UserAvatar name={nombre} size="md" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-pmd-darkBlue mb-2">{nombre}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="info">{translateArea(area)}</Badge>
                  <Badge variant={getStatusVariant(status)}>{translateStatus(status)}</Badge>
                  <Badge variant={getBadgeColorSeguro(estadoSeguro.estado)}>
                    {estadoSeguro.texto}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{puesto}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1"
                onClick={() => router.push(`/rrhh/${employee.id}`)}
              >
                <Eye className="h-4 w-4" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </>
  );
}

