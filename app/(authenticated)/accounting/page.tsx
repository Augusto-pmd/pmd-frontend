"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAccounting } from "@/hooks/api/accounting";
import { LoadingState } from "@/components/ui/LoadingState";
import { ResumenFinanciero } from "@/components/accounting/ResumenFinanciero";
import { CierresMensuales } from "@/components/accounting/CierresMensuales";
import { BotonVolver } from "@/components/ui/BotonVolver";

function AccountingContent() {
  const { accounting, isLoading, error } = useAccounting();

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando datos de contabilidad…" />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar los datos de contabilidad: {error.message || "Error desconocido"}
        </div>
      </MainLayout>
    );
  }

  // Extraer datos del objeto accounting
  const accountingData = accounting && typeof accounting === "object" && !Array.isArray(accounting)
    ? accounting
    : {};

  const ingresos = accountingData.ingresos || accountingData.totalIngresos || accountingData.totalAssets;
  const egresos = accountingData.egresos || accountingData.totalEgresos || accountingData.totalLiabilities;
  const saldo = accountingData.saldo || accountingData.netWorth;
  const cierres = accountingData.cierres || accountingData.monthlyClosures || [];

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="px-1">
          <BotonVolver />
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Contabilidad</h1>
          <p className="text-gray-600">Resumen financiero del sistema PMD</p>
        </div>

        <ResumenFinanciero
          ingresos={ingresos}
          egresos={egresos}
          saldo={saldo}
          totalAssets={accountingData.totalAssets}
          totalLiabilities={accountingData.totalLiabilities}
          netWorth={accountingData.netWorth}
        />

        <CierresMensuales cierres={Array.isArray(cierres) ? cierres : []} />
      </div>
    </MainLayout>
  );
}

export default function AccountingPage() {
  return (
    <ProtectedRoute>
      <AccountingContent />
    </ProtectedRoute>
  );
}
