"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface Work {
  id: string;
  name?: string;
  nombre?: string;
  title?: string;
  description?: string;
  descripcion?: string;
  status?: string;
  estado?: string;
  client?: string;
  cliente?: string;
  startDate?: string;
  fechaInicio?: string;
  estimatedStartDate?: string;
  [key: string]: any;
}

interface WorksListProps {
  works: Work[];
}

export function WorksList({ works }: WorksListProps) {
  const router = useRouter();

  const getWorkName = (work: Work) => {
    return work.nombre || work.name || work.title || "Sin nombre";
  };

  const getWorkDescription = (work: Work) => {
    return work.descripcion || work.description || "";
  };

  const getWorkStatus = (work: Work) => {
    return work.estado || work.status || "pendiente";
  };

  const getWorkClient = (work: Work) => {
    return work.cliente || work.client || null;
  };

  const getStartDate = (work: Work) => {
    const date = work.fechaInicio || work.startDate || work.estimatedStartDate;
    if (!date) return null;
    try {
      return new Date(date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return date;
    }
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

  if (works.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12 text-center">
        <p className="text-gray-600 text-lg">No hay obras registradas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {works.map((work) => (
        <Card
          key={work.id}
          className="border-l-4 border-pmd-gold hover:shadow-lg transition-shadow"
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-pmd-darkBlue mb-2">
                  {getWorkName(work)}
                </h3>
                {getWorkDescription(work) && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {getWorkDescription(work)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Estado:</span>
                  <Badge variant={getStatusVariant(getWorkStatus(work))}>
                    {getStatusLabel(getWorkStatus(work))}
                  </Badge>
                </div>

                {getWorkClient(work) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Cliente:</span>
                    <span className="text-sm text-gray-900 font-medium">
                      {getWorkClient(work)}
                    </span>
                  </div>
                )}

                {getStartDate(work) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Fecha de inicio:</span>
                    <span className="text-sm text-gray-900">
                      {getStartDate(work)}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/works/${work.id}`)}
                >
                  Ver obra
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

