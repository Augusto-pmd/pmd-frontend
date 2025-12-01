"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCashboxes, useCashMovements, cashboxApi, cashMovementApi } from "@/hooks/api/cashboxes";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

function CashboxContent() {
  const { cashboxes, isLoading, error } = useCashboxes();
  const primaryCashbox = cashboxes?.[0];
  const { movements, isLoading: movementsLoading } = useCashMovements(primaryCashbox?.id);

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Loading cashbox..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error loading cashbox: {error.message || "Unknown error"}
        </div>
      </MainLayout>
    );
  }

  const balance = primaryCashbox?.balance || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Cashbox – PMD Backend Integration</h1>
          <p className="text-gray-600">Manage cashbox transactions and balances</p>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6">
            <div className="bg-gray-50 rounded-pmd p-6">
              <p className="text-sm text-gray-600 mb-2">Current Cashbox Balance</p>
              <p className="text-3xl font-bold text-pmd-darkBlue">${balance.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Recent Transactions</h2>
            {movementsLoading ? (
              <LoadingState message="Loading transactions..." />
            ) : movements?.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                description="Transactions will appear here once you start recording cash movements"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {movements?.slice(0, 10).map((movement: any) => (
                      <tr key={movement.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {movement.date ? new Date(movement.date).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <Badge variant={movement.type === "income" ? "success" : "error"}>
                            {movement.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{movement.description || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                          ${movement.amount?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <Badge variant={movement.status === "completed" ? "success" : "warning"}>
                            {movement.status}
                          </Badge>
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

export default function CashboxPage() {
  return (
    <ProtectedRoute>
      <CashboxContent />
    </ProtectedRoute>
  );
}
