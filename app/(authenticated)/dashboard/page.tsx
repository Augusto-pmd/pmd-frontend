"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useWorks } from "@/hooks/api/works";
import { useExpenses } from "@/hooks/api/expenses";
import { useIncomes } from "@/hooks/api/incomes";
import { useContracts } from "@/hooks/api/contracts";
import { useAlertsStore } from "@/store/alertsStore";
import { useAccountingStore } from "@/store/accountingStore";
import { useCashboxStore } from "@/store/cashboxStore";
import { useClientsStore } from "@/store/clientsStore";
import { useDocumentsStore } from "@/store/documentsStore";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useEmployees } from "@/hooks/api/employees";
import { LoadingState } from "@/components/ui/LoadingState";
import { useEffect } from "react";
import { DashboardModules } from "@/components/dashboard/DashboardModules";
import { useAuthStore } from "@/store/authStore";
import { 
  TrendingUp, 
  FileText, 
  Bell, 
  Building2,
  DollarSign,
  Briefcase,
  AlertCircle,
  Activity,
  Users,
  Truck,
  Wallet,
  FolderOpen,
  UserRound
} from "lucide-react";

function DashboardContent() {
  const authState = useAuthStore.getState();
  const organizationId = (authState.user as any)?.organizationId || (authState.user as any)?.organization?.id;

  const { works, isLoading: worksLoading } = useWorks();
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { incomes, isLoading: incomesLoading } = useIncomes();
  const { contracts, isLoading: contractsLoading } = useContracts();
  const { alerts, isLoading: alertsLoading, fetchAlerts } = useAlertsStore();
  const { entries, isLoading: accountingLoading, fetchEntries } = useAccountingStore();
  const { cashboxes, isLoading: cashboxLoading, fetchCashboxes } = useCashboxStore();
  const { clients, isLoading: clientsLoading, fetchClients } = useClientsStore();
  const { documents, isLoading: documentsLoading, fetchDocuments } = useDocumentsStore();
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { employees, isLoading: employeesLoading } = useEmployees();

  useEffect(() => {
    if (organizationId) {
      fetchAlerts();
      fetchEntries();
      fetchCashboxes();
      fetchClients();
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const isLoading =
    worksLoading || expensesLoading || incomesLoading || contractsLoading || alertsLoading ||
    accountingLoading || cashboxLoading || clientsLoading || documentsLoading || suppliersLoading || employeesLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Cargando panel de control…" />
      </MainLayout>
    );
  }

  // Cálculos de KPIs
  const totalRevenue = incomes?.reduce((sum: number, inc: any) => sum + (inc.amount || 0), 0) || 0;
  const totalExpenses = expenses?.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0) || 0;
  const netBalance = totalRevenue - totalExpenses;
  
  // Contabilidad
  const accountingIngresos = entries?.filter((e: any) => e.type === "ingreso" || e.type === "income")
    .reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0;
  const accountingEgresos = entries?.filter((e: any) => e.type === "egreso" || e.type === "expense")
    .reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0;
  
  const activeContracts = contracts?.filter((c: any) => c.status === "active").length || 0;
  const pendingAlerts = alerts?.filter((a: any) => !a.read).length || 0;
  const highSeverityAlerts = alerts?.filter((a: any) => !a.read && a.severity === "alta").length || 0;
  const activeWorks = works?.filter((w: any) => w.status === "active" || w.status === "activa").length || 0;
  const totalWorks = works?.length || 0;
  const activeSuppliers = suppliers?.filter((s: any) => s.isActive !== false).length || 0;
  const totalSuppliers = suppliers?.length || 0;
  const activeEmployees = employees?.filter((e: any) => e.isActive !== false).length || 0;
  const totalEmployees = employees?.length || 0;
  const activeClients = clients?.filter((c: any) => c.status === "activo").length || 0;
  const totalClients = clients?.length || 0;
  const openCashboxes = cashboxes?.filter((c: any) => !c.isClosed).length || 0;
  const totalCashboxes = cashboxes?.length || 0;
  const pendingDocuments = documents?.filter((d: any) => d.status === "pendiente").length || 0;
  const totalDocuments = documents?.length || 0;

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
          <p className="text-sm text-gray-600">Resumen ejecutivo del sistema</p>
        </div>

        {/* KPIs Grid - Primera Fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Obras Activas */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1.5 uppercase tracking-wide">Obras</p>
                <p className="text-2xl font-semibold text-gray-900">{activeWorks}</p>
                <p className="text-xs text-gray-500 mt-0.5">de {totalWorks} totales</p>
              </div>
              <Building2 className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Ingresos Contabilidad */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1.5 uppercase tracking-wide">Ingresos</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(accountingIngresos || totalRevenue)}</p>
              </div>
              <DollarSign className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Egresos Contabilidad */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1.5 uppercase tracking-wide">Egresos</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(accountingEgresos || totalExpenses)}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Alertas Activas */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1.5 uppercase tracking-wide">Alertas</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingAlerts}</p>
                {highSeverityAlerts > 0 && (
                  <p className="text-xs text-red-500 mt-0.5">{highSeverityAlerts} alta severidad</p>
                )}
              </div>
              <Bell className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            </div>
          </div>
        </div>

        {/* KPIs Grid - Segunda Fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Staff */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1.5 uppercase tracking-wide">RRHH</p>
                <p className="text-2xl font-semibold text-gray-900">{activeEmployees}</p>
                <p className="text-xs text-gray-500 mt-0.5">de {totalEmployees} totales</p>
              </div>
              <Users className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Proveedores */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1.5 uppercase tracking-wide">Proveedores</p>
                <p className="text-2xl font-semibold text-gray-900">{activeSuppliers}</p>
                <p className="text-xs text-gray-500 mt-0.5">de {totalSuppliers} totales</p>
              </div>
              <Truck className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Clientes */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1.5 uppercase tracking-wide">Clientes</p>
                <p className="text-2xl font-semibold text-gray-900">{activeClients}</p>
                <p className="text-xs text-gray-500 mt-0.5">de {totalClients} totales</p>
              </div>
              <UserRound className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Cajas */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1.5 uppercase tracking-wide">Cajas</p>
                <p className="text-2xl font-semibold text-gray-900">{openCashboxes}</p>
                <p className="text-xs text-gray-500 mt-0.5">de {totalCashboxes} totales</p>
              </div>
              <Wallet className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            </div>
          </div>
        </div>

        {/* KPIs Grid - Tercera Fila */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Documentos */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1.5 uppercase tracking-wide">Documentos</p>
                <p className="text-2xl font-semibold text-gray-900">{totalDocuments}</p>
                {pendingDocuments > 0 && (
                  <p className="text-xs text-yellow-600 mt-0.5">{pendingDocuments} pendientes</p>
                )}
              </div>
              <FolderOpen className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Balance Neto */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1.5 uppercase tracking-wide">Balance Neto</p>
                <p className={`text-2xl font-semibold ${netBalance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {formatCurrency(netBalance)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Contratos */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1.5 uppercase tracking-wide">Contratos</p>
                <p className="text-2xl font-semibold text-gray-900">{activeContracts}</p>
              </div>
              <Briefcase className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-white/10"></div>

        {/* Módulos Principales */}
        <div>
          <h2 className="text-base font-medium text-gray-900 mb-4">Módulos Principales</h2>
          <DashboardModules />
        </div>

        {/* Separator */}
        <div className="border-t border-white/10"></div>

        {/* Actividad y Acciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actividad Reciente */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="h-5 w-5 text-gray-500" fill="currentColor" fillOpacity={0.3} />
              <h2 className="text-base font-semibold text-gray-900">Actividad Reciente</h2>
            </div>
            <div className="space-y-4">
              {works?.slice(0, 5).map((work: any) => (
                <div key={work.id} className="flex justify-between items-start pb-4 border-b border-white/10 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {work.name || work.title || work.nombre}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 capitalize">
                      {work.status || "Sin estado"}
                    </p>
                  </div>
                </div>
              ))}
              {(!works || works.length === 0) && (
                <p className="text-xs text-gray-500 text-center py-4">No hay actividad reciente</p>
              )}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="h-5 w-5 text-gray-500" fill="currentColor" fillOpacity={0.3} />
              <h2 className="text-base font-semibold text-gray-900">Acciones Rápidas</h2>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all text-sm text-gray-700 backdrop-blur-sm">
                Ver Reportes
              </button>
              <button className="w-full text-left px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all text-sm text-gray-700 backdrop-blur-sm">
                Gestionar Contratos
              </button>
              <button className="w-full text-left px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all text-sm text-gray-700 backdrop-blur-sm">
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
