"use client";

import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/settings/UserAvatar";
import { Building2, Mail, Phone, Calendar, AlertTriangle, Bell, Edit } from "lucide-react";
import { useAlertsStore } from "@/store/alertsStore";
import { useWorks } from "@/hooks/api/works";

interface Employee {
  id: string;
  fullName?: string;
  name?: string;
  nombre?: string;
  role?: string;
  subrole?: string;
  workId?: string;
  isActive?: boolean;
  email?: string;
  phone?: string;
  hireDate?: string;
  [key: string]: any;
}

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEdit?: (employee: Employee) => void;
  onAssignWork?: (employee: Employee) => void;
  onViewAlerts?: (employee: Employee) => void;
}

export function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
  onEdit,
  onAssignWork,
  onViewAlerts,
}: EmployeeDetailModalProps) {
  const { alerts } = useAlertsStore();
  const { works } = useWorks();

  if (!employee) return null;

  const getWorkName = (workId?: string) => {
    if (!workId) return null;
    const work = works.find((w: any) => w.id === workId);
    if (!work) return null;
    return work.name || work.title || work.nombre || workId;
  };

  const name = employee.fullName || employee.name || employee.nombre || "Sin nombre";
  const role = employee.role || "Sin rol";
  const subrole = employee.subrole || "";
  const isActive = employee.isActive !== false;
  const workName = getWorkName(employee.workId);
  const employeeAlerts = alerts.filter((alert) => alert.personId === employee.id);
  const unreadAlerts = employeeAlerts.filter((a) => !a.read).length;
  const highSeverityAlerts = employeeAlerts.filter((a) => a.severity === "alta").length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Personal" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
          <UserAvatar name={name} size="lg" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant={isActive ? "success" : "default"}>{isActive ? "Activo" : "Inactivo"}</Badge>
              <Badge variant="info">{role}</Badge>
              {subrole && <Badge variant="default">{subrole}</Badge>}
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Información de Contacto</h4>
          <div className="space-y-2">
            {employee.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{employee.email}</span>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{employee.phone}</span>
              </div>
            )}
            {employee.hireDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  Ingreso: {new Date(employee.hireDate).toLocaleDateString("es-AR")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Obra asignada */}
        {workName && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Obra Asignada</h4>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{workName}</span>
            </div>
          </div>
        )}

        {/* Alertas */}
        {employeeAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Alertas</h4>
            <div className="space-y-2">
              {employeeAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2 rounded border ${
                    alert.severity === "alta"
                      ? "border-red-200 bg-red-50"
                      : alert.severity === "media"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className={`h-4 w-4 mt-0.5 ${
                        alert.severity === "alta"
                          ? "text-red-600"
                          : alert.severity === "media"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900">{alert.title || alert.message}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              {employeeAlerts.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{employeeAlerts.length - 3} alerta{employeeAlerts.length - 3 !== 1 ? "s" : ""} más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="pt-4 border-t border-gray-200 flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onEdit?.(employee);
              onClose();
            }}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onAssignWork?.(employee);
              onClose();
            }}
            className="flex-1"
          >
            <Building2 className="h-4 w-4 mr-2" />
            {workName ? "Cambiar Obra" : "Asignar Obra"}
          </Button>
          {employeeAlerts.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                onViewAlerts?.(employee);
                onClose();
              }}
              className="flex-1"
            >
              <Bell className="h-4 w-4 mr-2" />
              Ver Alertas ({unreadAlerts})
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

