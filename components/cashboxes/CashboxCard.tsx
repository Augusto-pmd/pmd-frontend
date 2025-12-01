"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Cashbox {
  id: string;
  name?: string;
  nombre?: string;
  status?: string;
  estado?: string;
  state?: string;
  openDate?: string;
  fechaApertura?: string;
  openingDate?: string;
  closeDate?: string;
  fechaCierre?: string;
  closingDate?: string;
  balance?: number;
  saldo?: number;
  [key: string]: any;
}

interface CashboxCardProps {
  cashbox: Cashbox;
}

export function CashboxCard({ cashbox }: CashboxCardProps) {
  const router = useRouter();

  const getCashboxName = () => {
    return cashbox.nombre || cashbox.name || `Caja ${cashbox.id.slice(0, 8)}`;
  };

  const getCashboxStatus = () => {
    return cashbox.estado || cashbox.status || cashbox.state || "abierta";
  };

  const getStatusVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "abierta" || statusLower === "open" || statusLower === "opened") {
      return "success";
    }
    if (statusLower === "cerrada" || statusLower === "closed" || statusLower === "closed") {
      return "default";
    }
    return "default";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "open" || statusLower === "opened") return "Abierta";
    if (statusLower === "closed") return "Cerrada";
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

  const status = getCashboxStatus();
  const isOpen = status.toLowerCase() === "abierta" || status.toLowerCase() === "open" || status.toLowerCase() === "opened";

  return (
    <Card
      className={`border-l-4 hover:shadow-lg transition-shadow ${
        isOpen ? "border-green-500" : "border-gray-400"
      }`}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-pmd-darkBlue">{getCashboxName()}</h3>
              <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Fecha de apertura:</span>
              <span className="text-sm text-gray-900 font-medium">
                {formatDate(cashbox.fechaApertura || cashbox.openingDate || cashbox.openDate)}
              </span>
            </div>

            {(cashbox.fechaCierre || cashbox.closingDate || cashbox.closeDate) && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Fecha de cierre:</span>
                <span className="text-sm text-gray-900 font-medium">
                  {formatDate(cashbox.fechaCierre || cashbox.closingDate || cashbox.closeDate)}
                </span>
              </div>
            )}

            {(cashbox.balance !== undefined || cashbox.saldo !== undefined) && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Saldo:</span>
                <span className="text-sm text-gray-900 font-semibold">
                  ${((cashbox.balance || cashbox.saldo) || 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/cashboxes/${cashbox.id}`)}
            >
              Ver caja
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

