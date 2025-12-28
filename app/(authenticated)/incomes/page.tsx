"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useIncomes, incomeApi } from "@/hooks/api/incomes";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { IncomeForm } from "@/components/forms/IncomeForm";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useSWRConfig } from "swr";
import { refreshPatterns } from "@/lib/refreshData";
import { useToast } from "@/components/ui/Toast";
import { getOperationErrorMessage } from "@/lib/errorMessages";

function IncomesContent() {
  const { incomes, isLoading, error, mutate } = useIncomes();
  const { mutate: globalMutate } = useSWRConfig();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const totalIncome = incomes?.reduce((sum: number, inc: any) => sum + (inc.amount || 0), 0) || 0;
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthIncome =
    incomes?.filter((inc: any) => {
      const incDate = new Date(inc.date);
      return incDate.getMonth() === thisMonth && incDate.getFullYear() === thisYear;
    }).reduce((sum: number, inc: any) => sum + (inc.amount || 0), 0) || 0;

  const handleCreate = () => {
    setEditingIncome(null);
    setIsModalOpen(true);
  };

  const handleEdit = (income: any) => {
    setEditingIncome(income);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this income?")) return;
    setDeleteLoading(id);
    try {
      await incomeApi.delete(id);
      mutate();
      await refreshPatterns.afterIncomeUpdate(globalMutate);
      toast.success("Ingreso eliminado correctamente. Dashboard actualizado.");
    } catch (error: unknown) {
      const errorMessage = getOperationErrorMessage("delete", error);
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingIncome) {
        await incomeApi.update(editingIncome.id, data);
      } else {
        await incomeApi.create(data);
      }
      mutate();
      await refreshPatterns.afterIncomeUpdate(globalMutate);
      toast.success("Ingreso guardado correctamente. Dashboard actualizado.");
      setIsModalOpen(false);
      setEditingIncome(null);
    } catch (error: unknown) {
      const errorMessage = getOperationErrorMessage(editingIncome ? "update" : "create", error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading incomes..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
        Error loading incomes: {error.message || "Unknown error"}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Incomes – PMD Backend Integration</h1>
            <p className="text-gray-600">Track and manage all income sources</p>
          </div>
          <Button onClick={handleCreate}>+ Add Income</Button>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-green-600">${thisMonthIncome.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Average per Month</p>
                <p className="text-2xl font-bold text-green-600">
                  ${incomes?.length ? (totalIncome / incomes.length).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Income List</h2>
            {incomes?.length === 0 ? (
              <EmptyState
                title="No income records found"
                description="Create your first income record to get started"
                action={<Button onClick={handleCreate}>Create Income</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Source</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Method</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {incomes?.map((income: any) => {
                      const getTypeLabel = (type: string) => {
                        const typeMap: Record<string, string> = {
                          advance: "Anticipo",
                          certification: "Certificación",
                          final_payment: "Pago Final",
                          adjustment: "Ajuste",
                          reimbursement: "Reembolso",
                          other: "Otro",
                        };
                        return typeMap[type] || type;
                      };
                      
                      const getPaymentMethodLabel = (method: string) => {
                        const methodMap: Record<string, string> = {
                          transfer: "Transferencia",
                          check: "Cheque",
                          cash: "Efectivo",
                          payment_link: "Link de pago",
                        };
                        return methodMap[method] || "-";
                      };
                      
                      return (
                        <tr key={income.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {income.date ? new Date(income.date).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{income.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{getTypeLabel(income.type || "")}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{income.source}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{getPaymentMethodLabel(income.payment_method || "")}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-green-600">
                            ${income.amount?.toFixed(2) || "0.00"}
                          </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(income)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(income.id)}
                              disabled={deleteLoading === income.id}
                            >
                              {deleteLoading === income.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingIncome(null);
          }}
          title={editingIncome ? "Edit Income" : "Create Income"}
        >
          <IncomeForm
            initialData={editingIncome}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingIncome(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </>
  );
}

export default function IncomesPage() {
  return (
    <ProtectedRoute>
      <IncomesContent />
    </ProtectedRoute>
  );
}
