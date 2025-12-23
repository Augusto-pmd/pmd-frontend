"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useContracts, contractApi } from "@/hooks/api/contracts";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSWRConfig } from "swr";
import { useToast } from "@/components/ui/Toast";

function ContractsContent() {
  const router = useRouter();
  const { contracts, isLoading, error, mutate } = useContracts();
  const { mutate: globalMutate } = useSWRConfig();
  const user = useAuthStore.getState().user;
  const toast = useToast();
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "pending">("all");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const filteredContracts = contracts?.filter((contract: any) => {
    if (filter === "all") return true;
    return contract.status === filter;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contract?")) return;
    setDeleteLoading(id);
    try {
      await contractApi.delete(id);
      mutate();
      globalMutate("/contracts");
    } catch (error: any) {
      alert(error.message || "Failed to delete contract");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading contracts..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
        Error loading contracts: {error.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Contracts – PMD Backend Integration</h1>
            <p className="text-gray-600">Manage contracts and agreements</p>
          </div>
          <Button>+ New Contract</Button>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6 flex gap-2">
            {(["all", "active", "expired", "pending"] as const).map((f) => (
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

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Contract List</h2>
            {filteredContracts?.length === 0 ? (
              <EmptyState
                title="No contracts found"
                description="Contracts will appear here once created"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contract #</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">End Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Value</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredContracts?.map((contract: any) => (
                      <tr key={contract.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {contract.contractNumber || contract.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {contract.supplierName || contract.supplierId || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${contract.value?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-wrap gap-2">
                            {contract.is_blocked && (
                              <Badge variant="error">Bloqueado</Badge>
                            )}
                            {contract.status && (
                              <Badge
                                variant={
                                  contract.status === "active"
                                    ? "success"
                                    : contract.status === "expired"
                                    ? "error"
                                    : "warning"
                                }
                              >
                                {contract.status}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/contracts/${contract.id}`)}
                            >
                              Ver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(contract.id)}
                              disabled={deleteLoading === contract.id}
                            >
                              {deleteLoading === contract.id ? "Eliminando..." : "Eliminar"}
                            </Button>
                          </div>
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
  );
}

export default function ContractsPage() {
  return (
    <ProtectedRoute>
      <ContractsContent />
    </ProtectedRoute>
  );
}
