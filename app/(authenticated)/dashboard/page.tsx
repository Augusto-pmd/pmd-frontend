"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useWorks } from "@/hooks/api/works";
import { useExpenses } from "@/hooks/api/expenses";
import { useIncomes } from "@/hooks/api/incomes";
import { useContracts } from "@/hooks/api/contracts";
import { useAlerts } from "@/hooks/api/alerts";
import { LoadingState } from "@/components/ui/LoadingState";
import { DashboardModules } from "@/components/dashboard/DashboardModules";
import { 
  TrendingUp, 
  FileText, 
  Bell, 
  Building2,
  DollarSign,
  Briefcase,
  AlertCircle,
  Activity
} from "lucide-react";

function DashboardContent() {
  const { works, isLoading: worksLoading } = useWorks();
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { incomes, isLoading: incomesLoading } = useIncomes();
  const { contracts, isLoading: contractsLoading } = useContracts();
  const { alerts, isLoading: alertsLoading } = useAlerts();

  const isLoading =
    worksLoading || expensesLoading || incomesLoading || contractsLoading || alertsLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando panel de control…" />
      </MainLayout>
    );
  }

  const totalRevenue = incomes?.reduce((sum: number, inc: any) => sum + (inc.amount || 0), 0) || 0;
  const totalExpenses = expenses?.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0) || 0;
  const netBalance = totalRevenue - totalExpenses;
  const activeContracts = contracts?.filter((c: any) => c.status === "active").length || 0;
  const pendingAlerts = alerts?.filter((a: any) => !a.read).length || 0;
  const activeWorks = works?.filter((w: any) => w.status === "active").length || 0;
  const totalWorks = works?.length || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <MainLayout>
      <div className="space-y-8 py-6">
        {/* Header */}
        <div className="px-1">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard PMD</h1>
          <p className="text-xs text-gray-500">Resumen ejecutivo del sistema</p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ingresos Totales */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Ingresos</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-[18px] w-[18px] text-gray-400 flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Contratos Activos */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Contratos</p>
                <p className="text-2xl font-semibold text-gray-900">{activeContracts}</p>
              </div>
              <Briefcase className="h-[18px] w-[18px] text-gray-400 flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Alertas Pendientes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Alertas</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingAlerts}</p>
              </div>
              <Bell className="h-[18px] w-[18px] text-gray-400 flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Obras Activas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1.5 uppercase tracking-wide">Obras</p>
                <p className="text-2xl font-semibold text-gray-900">{activeWorks}</p>
                <p className="text-xs text-gray-400 mt-0.5">de {totalWorks} totales</p>
              </div>
              <Building2 className="h-[18px] w-[18px] text-gray-400 flex-shrink-0 mt-0.5" />
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200"></div>

        {/* Módulos Principales */}
        <div>
          <h2 className="text-base font-medium text-gray-900 mb-4">Módulos Principales</h2>
          <DashboardModules />
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200"></div>

        {/* Actividad y Acciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actividad Reciente */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="h-4 w-4 text-gray-400" />
              <h2 className="text-base font-medium text-gray-900">Actividad Reciente</h2>
            </div>
            <div className="space-y-4">
              {works?.slice(0, 5).map((work: any) => (
                <div key={work.id} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {work.name || work.title || work.nombre}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                      {work.status || "Sin estado"}
                    </p>
                  </div>
                </div>
              ))}
              {(!works || works.length === 0) && (
                <p className="text-xs text-gray-400 text-center py-4">No hay actividad reciente</p>
              )}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="h-4 w-4 text-gray-400" />
              <h2 className="text-base font-medium text-gray-900">Acciones Rápidas</h2>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm text-gray-700">
                Ver Reportes
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm text-gray-700">
                Gestionar Contratos
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm text-gray-700">
                Revisar Alertas
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
