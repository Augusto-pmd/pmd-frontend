"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Supplier {
  id: string;
  name?: string;
  nombre?: string;
  email?: string;
  contact?: string;
  contacto?: string;
  contactName?: string;
  status?: string;
  estado?: string;
  [key: string]: any;
}

interface SupplierCardProps {
  supplier: Supplier;
}

export function SupplierCard({ supplier }: SupplierCardProps) {
  const router = useRouter();

  const getSupplierName = () => {
    return supplier.nombre || supplier.name || "Sin nombre";
  };

  const getSupplierEmail = () => {
    return supplier.email || null;
  };

  const getSupplierContact = () => {
    return supplier.contacto || supplier.contact || supplier.contactName || null;
  };

  const getSupplierStatus = () => {
    return supplier.estado || supplier.status || "pendiente";
  };

  const getStatusVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "aprobado" || statusLower === "approved" || statusLower === "active") {
      return "success";
    }
    if (statusLower === "pendiente" || statusLower === "pending") {
      return "warning";
    }
    if (statusLower === "rechazado" || statusLower === "rejected" || statusLower === "inactive") {
      return "error";
    }
    return "default";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "approved") return "Aprobado";
    if (statusLower === "active") return "Aprobado";
    if (statusLower === "pending") return "Pendiente";
    if (statusLower === "rejected") return "Rechazado";
    if (statusLower === "inactive") return "Rechazado";
    return status;
  };

  return (
    <Card className="border-l-4 border-pmd-gold hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-pmd-darkBlue mb-2">
              {getSupplierName()}
            </h3>
          </div>

          <div className="space-y-2">
            {getSupplierEmail() && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Email:</span>
                <span className="text-sm text-gray-900 font-medium">{getSupplierEmail()}</span>
              </div>
            )}

            {getSupplierContact() && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Contacto:</span>
                <span className="text-sm text-gray-900">{getSupplierContact()}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Estado:</span>
              <Badge variant={getStatusVariant(getSupplierStatus())}>
                {getStatusLabel(getSupplierStatus())}
              </Badge>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/suppliers/${supplier.id}`)}
            >
              Ver proveedor
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

