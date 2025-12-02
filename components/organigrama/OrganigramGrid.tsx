"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/settings/UserAvatar";
import { Eye, Edit, Building2, AlertTriangle, Bell } from "lucide-react";
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

interface OrganigramGridProps {
  employees: Employee[];
  onViewDetail?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onAssignWork?: (employee: Employee) => void;
}

export function OrganigramGrid({
  employees,
  onViewDetail,
  onEdit,
  onAssignWork,
}: OrganigramGridProps) {
  const { alerts } = useAlertsStore();
  const { works } = useWorks();

  const getWorkName = (workId?: string) => {
    if (!workId) return null;
    const work = works.find((w: any) => w.id === workId);
    if (!work) return null;
    return work.name || work.title || work.nombre || workId;
  };

  const getEmployeeAlerts = (employeeId: string) => {
    return alerts.filter((alert) => alert.personId === employeeId);
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12 text-center">
        <p className="text-gray-600">No hay personal registrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map((employee) => {
        const name = employee.fullName || employee.name || employee.nombre || "Sin nombre";
        const role = employee.role || "Sin rol";
        const subrole = employee.subrole || "";
        const isActive = employee.isActive !== false;
        const workName = getWorkName(employee.workId);
        const employeeAlerts = getEmployeeAlerts(employee.id);
        const hasAlerts = employeeAlerts.length > 0;
        const unreadAlerts = employeeAlerts.filter((a) => !a.read).length;
        const highSeverityAlerts = employeeAlerts.filter((a) => a.severity === "alta").length;

        return (
          <Card
            key={employee.id}
            className={`border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
              !isActive ? "opacity-60" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header con avatar y nombre */}
                <div className="flex items-start gap-3">
                  <UserAvatar name={name} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-xs text-gray-600">{role}</p>
                      {subrole && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">{subrole}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={isActive ? "success" : "default"} className="text-xs">
                    {isActive ? "Activo" : "Inactivo"}
                  </Badge>
                  {workName && (
                    <Badge variant="info" className="text-xs flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {workName}
                    </Badge>
                  )}
                  {hasAlerts && (
                    <Badge
                      variant={highSeverityAlerts > 0 ? "error" : "warning"}
                      className="text-xs flex items-center gap-1"
                    >
                      <Bell className="h-3 w-3" />
                      {unreadAlerts > 0 ? `${unreadAlerts} alerta${unreadAlerts !== 1 ? "s" : ""}` : "Alertas"}
                    </Badge>
                  )}
                </div>

                {/* Acciones */}
                <div className="pt-2 border-t border-gray-100 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail?.(employee)}
                    className="flex-1 text-xs h-8"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(employee)}
                    className="flex-1 text-xs h-8"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                  {workName ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAssignWork?.(employee)}
                      className="flex-1 text-xs h-8"
                    >
                      <Building2 className="h-3.5 w-3.5 mr-1" />
                      Cambiar
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAssignWork?.(employee)}
                      className="flex-1 text-xs h-8"
                    >
                      <Building2 className="h-3.5 w-3.5 mr-1" />
                      Asignar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

