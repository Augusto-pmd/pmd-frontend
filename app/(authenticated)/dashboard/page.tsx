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
        <LoadingState message="Loading dashboard..." />
      </MainLayout>
    );
  }

  const totalRevenue = incomes?.reduce((sum: number, inc: any) => sum + (inc.amount || 0), 0) || 0;
  const activeContracts = contracts?.filter((c: any) => c.status === "active").length || 0;
  const pendingAlerts = alerts?.filter((a: any) => !a.read).length || 0;
  const activeWorks = works?.filter((w: any) => w.status === "active").length || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Dashboard – PMD Backend Integration</h1>
          <p className="text-gray-600">Overview and analytics dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-gold">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-mediumBlue">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Contracts</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">{activeContracts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-gold">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Alerts</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">{pendingAlerts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-mediumBlue">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Works</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">{activeWorks}</p>
          </div>
        </div>

        <DashboardModules />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-pmd p-6">
            <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {works?.slice(0, 5).map((work: any) => (
                <div key={work.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-pmd-darkBlue">{work.name || work.title}</p>
                    <p className="text-sm text-gray-500">{work.status}</p>
                  </div>
                </div>
              ))}
              {(!works || works.length === 0) && (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6">
            <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-pmd transition-colors">
                View Reports
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-pmd transition-colors">
                Manage Contracts
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-pmd transition-colors">
                Review Alerts
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
