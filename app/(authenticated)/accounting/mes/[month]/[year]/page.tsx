"use client";

import { useParams, useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAccountingMonth } from "@/hooks/api/accounting";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BotonVolver } from "@/components/ui/BotonVolver";

function AccountingMonthContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  const router = useRouter();
  
  // Safely extract and parse month and year from params
  const monthStr = typeof params?.month === "string" ? params.month : null;
  const yearStr = typeof params?.year === "string" ? params.year : null;
  const month = monthStr ? parseInt(monthStr, 10) : null;
  const year = yearStr ? parseInt(yearStr, 10) : null;
  
  const { monthData, isLoading, error } = useAccountingMonth(month, year);
  
  // Guard check after all hooks
  if (!month || !year || isNaN(month) || isNaN(year)) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Parámetros de mes o año inválidos
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/accounting")}>Volver a Contabilidad</Button>
        </div>
      </MainLayout>
    );
  }

  const getMonthName = (monthNum: number) => {
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
    return months[monthNum - 1] || `Mes ${monthNum}`;
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === null || amount === undefined) return "No disponible";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando datos del mes…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar los datos del mes: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/accounting")}>Volver a Contabilidad</Button>
        </div>
      </MainLayout>
    );
  }

  if (!monthData || (typeof monthData === "object" && Object.keys(monthData).length === 0)) {
    return (
      <MainLayout>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-pmd">
          No hay datos disponibles para este mes
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/accounting")}>Volver a Contabilidad</Button>
        </div>
      </MainLayout>
    );
  }

  const data = monthData && typeof monthData === "object" ? monthData : {};

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
        </div>
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">
              Detalle de Contabilidad — {month ? getMonthName(month) : ""} {year}
            </h1>
            <p className="text-gray-600">Información contable del período seleccionado</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/accounting")}>
            Volver a Contabilidad
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.ingresos !== undefined && (
            <Card className="border-l-4 border-green-500">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Ingresos</h3>
                <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(data.ingresos)}</p>
              </CardContent>
            </Card>
          )}

          {data.egresos !== undefined && (
            <Card className="border-l-4 border-red-500">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Egresos</h3>
                <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(data.egresos)}</p>
              </CardContent>
            </Card>
          )}

          {data.ivaCompras !== undefined && (
            <Card className="border-l-4 border-blue-500">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">IVA Compras</h3>
                <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(data.ivaCompras)}</p>
              </CardContent>
            </Card>
          )}

          {data.ivaVentas !== undefined && (
            <Card className="border-l-4 border-blue-500">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">IVA Ventas</h3>
                <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(data.ivaVentas)}</p>
              </CardContent>
            </Card>
          )}

          {data.percepciones !== undefined && (
            <Card className="border-l-4 border-purple-500">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Percepciones</h3>
                <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(data.percepciones)}</p>
              </CardContent>
            </Card>
          )}

          {data.retenciones !== undefined && (
            <Card className="border-l-4 border-purple-500">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Retenciones</h3>
                <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(data.retenciones)}</p>
              </CardContent>
            </Card>
          )}

          {data.totalGeneral !== undefined && (
            <Card className="border-l-4 border-pmd-gold">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total General</h3>
                <p
                  className={`text-2xl font-bold ${
                    (data.totalGeneral || 0) >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(data.totalGeneral)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mostrar otros campos si existen */}
        {Object.keys(data).some(
          (key) =>
            ![
              "ingresos",
              "egresos",
              "ivaCompras",
              "ivaVentas",
              "percepciones",
              "retenciones",
              "totalGeneral",
            ].includes(key) &&
            data[key] !== null &&
            data[key] !== undefined &&
            data[key] !== ""
        ) && (
          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(data)
                  .filter(
                    (key) =>
                      ![
                        "ingresos",
                        "egresos",
                        "ivaCompras",
                        "ivaVentas",
                        "percepciones",
                        "retenciones",
                        "totalGeneral",
                      ].includes(key) &&
                      data[key] !== null &&
                      data[key] !== undefined &&
                      data[key] !== ""
                  )
                  .map((key) => (
                    <div key={key}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </h3>
                      <p className="text-gray-900">
                        {typeof data[key] === "number"
                          ? formatCurrency(data[key])
                          : typeof data[key] === "object"
                          ? JSON.stringify(data[key])
                          : String(data[key])}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

export default function AccountingMonthPage() {
  return (
    <ProtectedRoute>
      <AccountingMonthContent />
    </ProtectedRoute>
  );
}

