"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useExpenses, expenseApi } from "@/hooks/api/expenses";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useSWRConfig } from "swr";

function ExpensesContent() {
  const { expenses, isLoading, error, mutate } = useExpenses();
  const { mutate: globalMutate } = useSWRConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const totalExpenses = expenses?.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0) || 0;
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthExpenses =
    expenses?.filter((exp: any) => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === thisMonth && expDate.getFullYear() === thisYear;
    }).reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0) || 0;

  const handleCreate = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    setDeleteLoading(id);
    try {
      await expenseApi.delete(id);
      mutate();
      globalMutate("/expenses");
    } catch (error: any) {
      alert(error.message || "Failed to delete expense");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await expenseApi.update(editingExpense.id, data);
      } else {
        await expenseApi.create(data);
      }
      mutate();
      globalMutate("/expenses");
      setIsModalOpen(false);
      setEditingExpense(null);
    } catch (error: any) {
      alert(error.message || "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState message="Loading expenses..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error loading expenses: {error.message || "Unknown error"}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Expenses – PMD Backend Integration</h1>
            <p className="text-gray-600">Track and manage all expenses</p>
          </div>
          <Button onClick={handleCreate}>+ Add Expense</Button>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">${totalExpenses.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">${thisMonthExpenses.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Average per Month</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">
                  ${expenses?.length ? (totalExpenses / expenses.length).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Expense List</h2>
            {expenses?.length === 0 ? (
              <EmptyState
                title="No expenses found"
                description="Create your first expense to get started"
                action={<Button onClick={handleCreate}>Create Expense</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenses?.map((expense: any) => (
                      <tr key={expense.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {expense.date ? new Date(expense.date).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{expense.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{expense.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                          ${expense.amount?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(expense)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(expense.id)}
                              disabled={deleteLoading === expense.id}
                            >
                              {deleteLoading === expense.id ? "Deleting..." : "Delete"}
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

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingExpense(null);
          }}
          title={editingExpense ? "Edit Expense" : "Create Expense"}
        >
          <ExpenseForm
            initialData={editingExpense}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingExpense(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </MainLayout>
  );
}

export default function ExpensesPage() {
  return (
    <ProtectedRoute>
      <ExpensesContent />
    </ProtectedRoute>
  );
}
