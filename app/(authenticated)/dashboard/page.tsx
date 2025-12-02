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

  // KPI Card Component
  const KPICard = ({ 
    label, 
    value, 
    subtitle, 
    icon: Icon,
    warning 
  }: { 
    label: string; 
    value: string | number; 
    subtitle?: string;
    icon: any;
    warning?: string;
  }) => (
    <div 
      className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.06)] p-6 transition-all duration-200 hover:shadow-[0px_12px_32px_rgba(0,0,0,0.08)]"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p 
            className="text-[13px] text-[#7A7A7C] mb-2 uppercase tracking-wide"
            style={{ fontWeight: 400 }}
          >
            {label}
          </p>
          <p 
            className="text-[28px] text-[#1C1C1E] mb-1"
            style={{ fontWeight: 600 }}
          >
            {value}
          </p>
          {subtitle && (
            <p 
              className="text-[13px] text-[#7A7A7C]"
              style={{ fontWeight: 400 }}
            >
              {subtitle}
            </p>
          )}
          {warning && (
            <p 
              className="text-[13px] text-[#7A7A7C] mt-1"
              style={{ fontWeight: 400 }}
            >
              {warning}
            </p>
          )}
        </div>
        <Icon 
          className="w-5 h-5 text-[#1C1C1E] flex-shrink-0 mt-1" 
          strokeWidth={2}
        />
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="p-6 lg:p-8" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        {/* Header Section */}
        <div className="mb-10">
          <h1 
            className="text-[24px] text-[#1C1C1E] mb-2"
            style={{ fontWeight: 600 }}
          >
            Dashboard PMD
          </h1>
          <p 
            className="text-[15px] text-[#7A7A7C]"
            style={{ fontWeight: 400 }}
          >
            Resumen ejecutivo del sistema
          </p>
        </div>

        {/* KPIs Grid - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <KPICard
            label="Obras"
            value={activeWorks}
            subtitle={`de ${totalWorks} totales`}
            icon={Building2}
          />
          <KPICard
            label="Ingresos"
            value={formatCurrency(accountingIngresos || totalRevenue)}
            icon={DollarSign}
          />
          <KPICard
            label="Egresos"
            value={formatCurrency(accountingEgresos || totalExpenses)}
            icon={TrendingUp}
          />
          <KPICard
            label="Alertas"
            value={pendingAlerts}
            warning={highSeverityAlerts > 0 ? `${highSeverityAlerts} alta severidad` : undefined}
            icon={Bell}
          />
        </div>

        {/* KPIs Grid - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <KPICard
            label="RRHH"
            value={activeEmployees}
            subtitle={`de ${totalEmployees} totales`}
            icon={Users}
          />
          <KPICard
            label="Proveedores"
            value={activeSuppliers}
            subtitle={`de ${totalSuppliers} totales`}
            icon={Truck}
          />
          <KPICard
            label="Clientes"
            value={activeClients}
            subtitle={`de ${totalClients} totales`}
            icon={UserRound}
          />
          <KPICard
            label="Cajas"
            value={openCashboxes}
            subtitle={`de ${totalCashboxes} totales`}
            icon={Wallet}
          />
        </div>

        {/* KPIs Grid - Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          <KPICard
            label="Documentos"
            value={totalDocuments}
            warning={pendingDocuments > 0 ? `${pendingDocuments} pendientes` : undefined}
            icon={FolderOpen}
          />
          <KPICard
            label="Balance Neto"
            value={formatCurrency(netBalance)}
            icon={TrendingUp}
          />
          <KPICard
            label="Contratos"
            value={activeContracts}
            icon={Briefcase}
          />
        </div>

        {/* Separator */}
        <div className="border-t border-[rgba(0,0,0,0.08)] mb-10"></div>

        {/* Main Modules Section */}
        <div className="mb-10">
          <h2 
            className="text-[24px] text-[#1C1C1E] mb-6"
            style={{ fontWeight: 600 }}
          >
            Módulos Principales
          </h2>
          <DashboardModules />
        </div>

        {/* Separator */}
        <div className="border-t border-[rgba(0,0,0,0.08)] mb-10"></div>

        {/* Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div 
            className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.06)] p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-[#1C1C1E]" strokeWidth={2} />
              <h2 
                className="text-[17px] text-[#1C1C1E]"
                style={{ fontWeight: 500 }}
              >
                Actividad Reciente
              </h2>
            </div>
            <div className="space-y-4">
              {works?.slice(0, 5).map((work: any) => (
                <div 
                  key={work.id} 
                  className="flex justify-between items-start pb-4 border-b border-[rgba(0,0,0,0.08)] last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-[14px] text-[#1C1C1E] truncate mb-1"
                      style={{ fontWeight: 500 }}
                    >
                      {work.name || work.title || work.nombre}
                    </p>
                    <p 
                      className="text-[13px] text-[#7A7A7C] capitalize"
                      style={{ fontWeight: 400 }}
                    >
                      {work.status || "Sin estado"}
                    </p>
                  </div>
                </div>
              ))}
              {(!works || works.length === 0) && (
                <p 
                  className="text-[13px] text-[#7A7A7C] text-center py-8"
                  style={{ fontWeight: 400 }}
                >
                  No hay actividad reciente
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div 
            className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl shadow-[0px_8px_24px_rgba(0,0,0,0.06)] p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-[#1C1C1E]" strokeWidth={2} />
              <h2 
                className="text-[17px] text-[#1C1C1E]"
                style={{ fontWeight: 500 }}
              >
                Acciones Rápidas
              </h2>
            </div>
            <div className="space-y-3">
              <button 
                className="w-full text-left px-4 py-3 bg-white text-[#1C1C1E] border border-[rgba(0,0,0,0.15)] rounded-xl transition-all duration-200 hover:bg-[#F2F2F2] active:bg-[#E8E8E8] text-[14px]"
                style={{ fontWeight: 500 }}
              >
                Ver Reportes
              </button>
              <button 
                className="w-full text-left px-4 py-3 bg-white text-[#1C1C1E] border border-[rgba(0,0,0,0.15)] rounded-xl transition-all duration-200 hover:bg-[#F2F2F2] active:bg-[#E8E8E8] text-[14px]"
                style={{ fontWeight: 500 }}
              >
                Gestionar Contratos
              </button>
              <button 
                className="w-full text-left px-4 py-3 bg-white text-[#1C1C1E] border border-[rgba(0,0,0,0.15)] rounded-xl transition-all duration-200 hover:bg-[#F2F2F2] active:bg-[#E8E8E8] text-[14px]"
                style={{ fontWeight: 500 }}
              >
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
