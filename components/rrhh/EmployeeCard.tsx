"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/settings/UserAvatar";
import { calcularEstadoSeguro, getBadgeColorSeguro } from "@/utils/seguro";

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
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const router = useRouter();

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

  return (
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

          <div className="pt-2 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/rrhh/${employee.id}`)}
            >
              Ver ficha
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

