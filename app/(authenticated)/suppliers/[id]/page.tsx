"use client";

import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useSupplier } from "@/hooks/api/suppliers";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BotonVolver } from "@/components/ui/BotonVolver";

function SupplierDetailContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  const router = useRouter();
  
  // Safely extract id from params
  const id = typeof params?.id === "string" ? params.id : null;
  
  const { supplier, isLoading, error } = useSupplier(id || "");

  // Guard check after all hooks
  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando proveedor…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar el proveedor: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/suppliers")}>Volver a Proveedores</Button>
        </div>
      </MainLayout>
    );
  }

  if (!supplier) {
    return (
      <MainLayout>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-pmd">
          Proveedor no encontrado
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/suppliers")}>Volver a Proveedores</Button>
        </div>
      </MainLayout>
    );
  }

  const getSupplierName = () => {
    return supplier.nombre || supplier.name || "Sin nombre";
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

  // Función para renderizar un campo si existe
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
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Detalle del proveedor</h1>
            <p className="text-gray-600">Información completa del proveedor seleccionado</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/suppliers")}>
            Volver a Proveedores
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{getSupplierName()}</CardTitle>
              <Badge variant={getStatusVariant(getSupplierStatus())}>
                {getStatusLabel(getSupplierStatus())}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField("Nombre", supplier.nombre || supplier.name)}
              {renderField("Email", supplier.email)}
              {renderField("Contacto", supplier.contacto || supplier.contact || supplier.contactName)}
              {renderField("Teléfono", supplier.telefono || supplier.phone)}
              {renderField("Dirección", supplier.direccion || supplier.address)}
              {renderField("CUIT", supplier.cuit || supplier.CUIT)}
              {renderField("Estado", getStatusLabel(getSupplierStatus()))}
              {renderField("Fecha de creación", supplier.createdAt, formatDate)}
              {renderField("Última actualización", supplier.updatedAt, formatDate)}
            </div>

            {/* Mostrar campos adicionales si existen */}
            {Object.keys(supplier).some(
              (key) =>
                !["id", "nombre", "name", "email", "contacto", "contact", "contactName", "telefono", "phone", "direccion", "address", "cuit", "CUIT", "estado", "status", "createdAt", "updatedAt"].includes(
                  key
                ) && supplier[key] !== null && supplier[key] !== undefined && supplier[key] !== ""
            ) && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Información adicional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(supplier)
                    .filter(
                      (key) =>
                        !["id", "nombre", "name", "email", "contacto", "contact", "contactName", "telefono", "phone", "direccion", "address", "cuit", "CUIT", "estado", "status", "createdAt", "updatedAt"].includes(
                          key
                        ) && supplier[key] !== null && supplier[key] !== undefined && supplier[key] !== ""
                    )
                    .map((key) => (
                      <div key={key}>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </h3>
                        <p className="text-gray-900">
                          {typeof supplier[key] === "object"
                            ? JSON.stringify(supplier[key])
                            : String(supplier[key])}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {supplier.id && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">ID del proveedor</h3>
                <p className="text-gray-600 font-mono text-sm">{supplier.id}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default function SupplierDetailPage() {
  return (
    <ProtectedRoute>
      <SupplierDetailContent />
    </ProtectedRoute>
  );
}

