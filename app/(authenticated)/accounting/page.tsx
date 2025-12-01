"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAccounting } from "@/hooks/api/accounting";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { BotonVolver } from "@/components/ui/BotonVolver";

function AccountingContent() {
  const { accounting, isLoading, error } = useAccounting();

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Loading accounting data..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error loading accounting: {error.message || "Unknown error"}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <BotonVolver />
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Accounting – PMD Backend Integration</h1>
          <p className="text-gray-600">Financial accounting and reporting</p>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Total Assets</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">
                  ${accounting?.totalAssets?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Total Liabilities</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">
                  ${accounting?.totalLiabilities?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Net Worth</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">
                  ${((accounting?.totalAssets || 0) - (accounting?.totalLiabilities || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Accounting Reports</h2>
            {!accounting || (Array.isArray(accounting) && accounting.length === 0) ? (
              <EmptyState
                title="No reports available"
                description="Accounting reports will appear here once data is available"
              />
            ) : (
              <div className="space-y-2">
                <p className="text-gray-500 text-sm">Accounting data loaded successfully</p>
              </div>
            )}
          </div>
        </div>
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
