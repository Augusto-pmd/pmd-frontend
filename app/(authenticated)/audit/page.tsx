"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuditLogs } from "@/hooks/api/audit";
import { useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { BotonVolver } from "@/components/ui/BotonVolver";

function AuditContent() {
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all");
  
  const getDateRange = () => {
    const now = new Date();
    switch (filter) {
      case "today":
        return {
          startDate: new Date(now.setHours(0, 0, 0, 0)).toISOString(),
          endDate: new Date().toISOString(),
        };
      case "week":
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return {
          startDate: weekAgo.toISOString(),
          endDate: new Date().toISOString(),
        };
      case "month":
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return {
          startDate: monthAgo.toISOString(),
          endDate: new Date().toISOString(),
        };
      default:
        return undefined;
    }
  };

  const { logs, isLoading, error } = useAuditLogs(getDateRange());

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Loading audit logs..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error loading audit logs: {error.message || "Unknown error"}
        </div>
      </MainLayout>
    );
  }

  const todayCount = logs?.filter((log: any) => {
    const logDate = new Date(log.timestamp || log.createdAt);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length || 0;

  const weekCount = logs?.filter((log: any) => {
    const logDate = new Date(log.timestamp || log.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  }).length || 0;

  const monthCount = logs?.filter((log: any) => {
    const logDate = new Date(log.timestamp || log.createdAt);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return logDate >= monthAgo;
  }).length || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <BotonVolver />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Audit Log – PMD Backend Integration</h1>
            <p className="text-gray-600">System activity and audit trail</p>
          </div>
          <div className="flex gap-2">
            {(["all", "today", "week", "month"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-pmd font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-pmd-darkBlue text-pmd-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Total Events</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">{logs?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Today</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">{todayCount}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">{weekCount}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">{monthCount}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Audit Trail</h2>
            {logs?.length === 0 ? (
              <EmptyState
                title="No audit records found"
                description="Audit logs will appear here as system activity occurs"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Timestamp</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Entity</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs?.map((log: any) => (
                      <tr key={log.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {log.timestamp || log.createdAt
                            ? new Date(log.timestamp || log.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {log.userName || log.userId || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{log.action || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{log.entity || log.entityType || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {log.details || log.description || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function AuditPage() {
  return (
    <ProtectedRoute>
      <AuditContent />
    </ProtectedRoute>
  );
}
