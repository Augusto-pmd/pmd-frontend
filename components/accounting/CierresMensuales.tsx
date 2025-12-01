"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface CierreMensual {
  month: number;
  year: number;
  status?: string;
  estado?: string;
  total?: number;
  [key: string]: any;
}

interface CierresMensualesProps {
  cierres?: CierreMensual[];
}

export function CierresMensuales({ cierres = [] }: CierresMensualesProps) {
  const router = useRouter();

  const getMonthName = (month: number) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[month - 1] || `Mes ${month}`;
  };

  const getStatusVariant = (status: string | undefined) => {
    if (!status) return "default";
    const statusLower = status.toLowerCase();
    if (statusLower === "cerrado" || statusLower === "closed" || statusLower === "completado") {
      return "success";
    }
    if (statusLower === "abierto" || statusLower === "open" || statusLower === "pendiente") {
      return "warning";
    }
    return "default";
  };

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return "Sin estado";
    const statusLower = status.toLowerCase();
    if (statusLower === "closed") return "Cerrado";
    if (statusLower === "open") return "Abierto";
    return status;
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "No disponible";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Generar últimos 12 meses si no hay cierres
  const generateRecentMonths = (): CierreMensual[] => {
    const months: CierreMensual[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        status: "abierto",
      });
    }
    return months;
  };

  const mesesToShow = cierres.length > 0 ? cierres : generateRecentMonths();

  if (mesesToShow.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-6">
        <p className="text-gray-600 text-center">No hay cierres mensuales disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-pmd p-6">
      <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Cierres Mensuales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mesesToShow.map((cierre, index) => (
          <div
            key={`${cierre.year}-${cierre.month}-${index}`}
            onClick={() => router.push(`/accounting/mes/${cierre.month}/${cierre.year}`)}
            className="cursor-pointer"
          >
            <Card className="border-l-4 border-pmd-gold hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-pmd-darkBlue">
                    {getMonthName(cierre.month)} {cierre.year}
                  </h3>
                  <Badge variant={getStatusVariant(cierre.status || (cierre as any).estado)}>
                    {getStatusLabel(cierre.status || (cierre as any).estado)}
                  </Badge>
                </div>
                {cierre.total !== undefined && (
                  <p className="text-sm text-gray-600 mb-2">Total: {formatCurrency(cierre.total)}</p>
                )}
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Ver detalle
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

