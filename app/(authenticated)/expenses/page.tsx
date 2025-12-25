"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useExpenses, expenseApi } from "@/hooks/api/expenses";
import { useContracts } from "@/hooks/api/contracts";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSWRConfig } from "swr";
import { useToast } from "@/components/ui/Toast";
import { Expense, CreateExpenseData } from "@/lib/types/expense";

function ExpensesContent() {
  const router = useRouter();
  const { expenses, isLoading, error, mutate } = useExpenses();
  const { contracts } = useContracts();
  const { mutate: globalMutate } = useSWRConfig();
  const user = useAuthStore.getState().user;
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [validatingExpenseId, setValidatingExpenseId] = useState<string | null>(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [validateState, setValidateState] = useState<"validated" | "observed" | "annulled">("validated");
  const [validateObservations, setValidateObservations] = useState("");

  // Verificar permisos para validar gastos
  const canValidate = user?.role?.name === "ADMINISTRATION" || user?.role?.name === "DIRECTION";

  const totalExpenses = expenses?.reduce((sum: number, exp: Expense) => sum + (exp.amount || 0), 0) || 0;
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthExpenses =
    expenses?.filter((exp: Expense) => {
      const expDate = new Date(exp.date || exp.purchase_date);
      return expDate.getMonth() === thisMonth && expDate.getFullYear() === thisYear;
    }).reduce((sum: number, exp: Expense) => sum + (exp.amount || 0), 0) || 0;

  const handleCreate = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
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
      toast.success("Gasto eliminado correctamente");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar el gasto";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleValidateClick = (expense: Expense, state: "validated" | "observed" | "annulled") => {
    setEditingExpense(expense);
    setValidateState(state);
    setValidateObservations("");
    setShowValidateModal(true);
  };

  const handleValidate = async () => {
    if (!editingExpense) return;
    
    setValidatingExpenseId(editingExpense.id);
    try {
      await expenseApi.validate(editingExpense.id, validateState, validateObservations || undefined);
      mutate();
      globalMutate("/expenses");
      
      // Mensaje informativo sobre reversión de saldo si se observa o anula un gasto con contrato
      const hasContract = editingExpense.contract_id;
      if (hasContract && (validateState === "observed" || validateState === "annulled")) {
        toast.success(
          `${validateState === "observed" ? "Gasto observado" : "Gasto anulado"}. El saldo del contrato se ha revertido automáticamente.`,
          5000
        );
      } else {
        toast.success(
          validateState === "validated"
            ? "Gasto validado correctamente"
            : validateState === "observed"
            ? "Gasto observado"
            : "Gasto anulado"
        );
      }
      
      setShowValidateModal(false);
      setEditingExpense(null);
      setValidateObservations("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al validar el gasto";
      toast.error(errorMessage);
    } finally {
      setValidatingExpenseId(null);
    }
  };

  const getContractName = (contractId?: string) => {
    if (!contractId) return "-";
    const contract = contracts?.find((c) => c.id === contractId);
    return (contract as any)?.contract_number || (contract as any)?.number || `Contrato ${contractId.slice(0, 8)}`;
  };

  const getStateBadgeVariant = (state?: string) => {
    if (!state) return "default";
    const stateLower = state.toLowerCase();
    if (stateLower === "validated") return "success";
    if (stateLower === "observed") return "warning";
    if (stateLower === "annulled") return "error";
    return "default";
  };

  const getStateLabel = (state?: string) => {
    if (!state) return "Pendiente";
    const stateLower = state.toLowerCase();
    if (stateLower === "validated") return "Validado";
    if (stateLower === "observed") return "Observado";
    if (stateLower === "annulled") return "Anulado";
    return state;
  };

  const handleSubmit = async (data: CreateExpenseData) => {
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
      toast.success(editingExpense ? "Gasto actualizado correctamente" : "Gasto creado correctamente");
    } catch (error: unknown) {
      // Manejar errores específicos del backend
      const errorMessage = error instanceof Error ? error.message : "Error al guardar el gasto";
      
      // Verificar si el error es por proveedor bloqueado
      if (errorMessage.toLowerCase().includes("blocked") || 
          errorMessage.toLowerCase().includes("bloqueado") ||
          errorMessage.toLowerCase().includes("art") ||
          errorMessage.toLowerCase().includes("vencida")) {
        toast.error(
          "No se puede crear el gasto: El proveedor está bloqueado debido a ART vencida. Por favor, contacta a Dirección para desbloquear el proveedor.",
          6000
        );
      } 
      // Verificar si el error es por obra cerrada
      else if (errorMessage.toLowerCase().includes("closed") || 
               errorMessage.toLowerCase().includes("cerrada") ||
               errorMessage.toLowerCase().includes("finished") ||
               errorMessage.toLowerCase().includes("finalizada")) {
        toast.error(
          "No se puede crear el gasto: La obra está cerrada. Solo Dirección puede crear gastos en obras cerradas. Contacta a Dirección para más información.",
          6000
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading expenses..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
        Error loading expenses: {error.message || "Unknown error"}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Expenses – PMD Backend Integration</h1>
            <p className="text-gray-600">Track and manage all expenses</p>
          </div>
          <Button onClick={handleCreate}>+ Crear Gasto</Button>
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
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">VAL</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contrato</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenses?.map((expense: Expense) => {
                      const expenseState = expense.state || expense.estado || "pending";
                      const isPending = expenseState.toLowerCase() === "pending";
                      
                      return (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {expense.date || expense.purchase_date
                              ? new Date(expense.date || expense.purchase_date).toLocaleDateString("es-ES")
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{expense.description || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{expense.category || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                            ${expense.amount?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {expense.document_type === "VAL" && expense.document_number ? (
                              <Badge variant="info" className="font-mono">
                                {expense.document_number}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={getStateBadgeVariant(expenseState)}>
                              {getStateLabel(expenseState)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {expense.contract_id ? (
                              <span
                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                onClick={() => router.push(`/contracts/${expense.contract_id}`)}
                                title="Ver contrato"
                              >
                                {getContractName(expense.contract_id)}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/expenses/${expense.id}`)}
                              >
                                Ver
                              </Button>
                              {canValidate && isPending && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleValidateClick(expense, "validated")}
                                    disabled={validatingExpenseId === expense.id}
                                  >
                                    Validar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleValidateClick(expense, "observed")}
                                    disabled={validatingExpenseId === expense.id}
                                  >
                                    Observar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleValidateClick(expense, "annulled")}
                                    disabled={validatingExpenseId === expense.id}
                                    style={{ color: "rgba(255, 59, 48, 1)" }}
                                  >
                                    Anular
                                  </Button>
                                </>
                              )}
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
            setEditingExpense(null);
          }}
          title={editingExpense ? "Editar Gasto" : "Crear Gasto"}
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

        {/* Modal de validación */}
        <Modal
          isOpen={showValidateModal}
          onClose={() => {
            setShowValidateModal(false);
            setEditingExpense(null);
            setValidateObservations("");
          }}
          title={
            validateState === "validated"
              ? "Validar Gasto"
              : validateState === "observed"
              ? "Observar Gasto"
              : "Anular Gasto"
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {validateState === "validated"
                  ? "¿Estás seguro de validar este gasto?"
                  : validateState === "observed"
                  ? "Ingresa las observaciones para este gasto:"
                  : "¿Estás seguro de anular este gasto?"}
              </p>
              {editingExpense && (
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <p className="text-sm font-medium">{editingExpense.description || "Sin descripción"}</p>
                  <p className="text-sm text-gray-600">
                    Monto: ${editingExpense.amount?.toFixed(2) || "0.00"}
                  </p>
                  {editingExpense.contract_id && (
                    <p className="text-sm text-blue-600">
                      Contrato: {getContractName(editingExpense.contract_id)}
                    </p>
                  )}
                </div>
              )}
            </div>
            {(validateState === "observed" || validateState === "annulled") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones {validateState === "observed" ? "(opcional)" : ""}
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={validateObservations}
                  onChange={(e) => setValidateObservations(e.target.value)}
                  placeholder="Ingresa las observaciones..."
                />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowValidateModal(false);
                  setEditingExpense(null);
                  setValidateObservations("");
                }}
                disabled={validatingExpenseId === editingExpense?.id}
              >
                Cancelar
              </Button>
              <Button
                variant={validateState === "annulled" ? "outline" : "primary"}
                onClick={handleValidate}
                disabled={validatingExpenseId === editingExpense?.id}
                style={
                  validateState === "annulled"
                    ? { color: "rgba(255, 59, 48, 1)", borderColor: "rgba(255, 59, 48, 1)" }
                    : {}
                }
              >
                {validatingExpenseId === editingExpense?.id
                  ? "Procesando..."
                  : validateState === "validated"
                  ? "Validar"
                  : validateState === "observed"
                  ? "Observar"
                  : "Anular"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}

export default function ExpensesPage() {
  return (
    <ProtectedRoute>
      <ExpensesContent />
    </ProtectedRoute>
  );
}
