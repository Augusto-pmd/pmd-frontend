"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EntryForm } from "@/app/(authenticated)/accounting/components/EntryForm";
import { useAccountingStore, AccountingEntry } from "@/store/accountingStore";
import { useToast } from "@/components/ui/Toast";
import { Edit, Trash2, Eye, Plus, Filter, X } from "lucide-react";
import { useWorks } from "@/hooks/api/works";
import { useSuppliers } from "@/hooks/api/suppliers";

interface AccountingTableProps {
  entries: AccountingEntry[];
  onRefresh: () => void;
}

export function AccountingTable({ entries, onRefresh }: AccountingTableProps) {
  const router = useRouter();
  const { works } = useWorks();
  const { suppliers } = useSuppliers();
  const { updateEntry, deleteEntry } = useAccountingStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AccountingEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getWorkName = (workId?: string) => {
    if (!workId) return "-";
    const work = works?.find((w: any) => w.id === workId);
    if (!work) return "-";
    return work.nombre || work.name || work.title || "-";
  };

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return "-";
    const supplier = suppliers?.find((s: any) => s.id === supplierId);
    if (!supplier) return "-";
    return supplier.nombre || supplier.name || "-";
  };

  const getTypeLabel = (type: string) => {
    const typeLower = type?.toLowerCase() || "";
    if (typeLower === "ingreso" || typeLower === "income") return "Ingreso";
    if (typeLower === "egreso" || typeLower === "expense") return "Egreso";
    return type || "-";
  };

  const getTypeVariant = (type: string) => {
    const typeLower = type?.toLowerCase() || "";
    if (typeLower === "ingreso" || typeLower === "income") return "success";
    if (typeLower === "egreso" || typeLower === "expense") return "error";
    return "default";
  };

  const handleUpdate = async (data: any) => {
    if (!selectedEntry) return;
    setIsSubmitting(true);
    try {
      await updateEntry(selectedEntry.id, data);
      await onRefresh();
      toast.success("Movimiento actualizado correctamente");
      setIsEditModalOpen(false);
      setSelectedEntry(null);
    } catch (err: any) {
      console.error("Error al actualizar movimiento:", err);
      toast.error(err.message || "Error al actualizar el movimiento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    setIsSubmitting(true);
    try {
      await deleteEntry(selectedEntry.id);
      await onRefresh();
      toast.success("Movimiento eliminado correctamente");
      setIsDeleteModalOpen(false);
      setSelectedEntry(null);
    } catch (err: any) {
      console.error("Error al eliminar movimiento:", err);
      toast.error(err.message || "Error al eliminar el movimiento");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-12 text-center">
        <p className="text-gray-600 text-lg">No hay movimientos registrados</p>
        <p className="text-gray-500 text-sm mt-2">
          Los movimientos contables aparecerán aquí cuando se registren
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Obra
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Notas
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {entries.map((entry, index) => (
                <tr key={entry.id} className={`hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-white/5">
                    {formatDate(entry.date || entry.fecha)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-white/5">
                    {getWorkName(entry.workId || entry.obraId || undefined)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-white/5">
                    {getSupplierName(entry.supplierId || entry.proveedorId || undefined)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-white/5">
                    <Badge variant={getTypeVariant(entry.type || entry.tipo || "")}>
                      {getTypeLabel(entry.type || entry.tipo || "")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 border-b border-white/5">
                    {formatCurrency(entry.amount || entry.monto || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b border-white/5">
                    {entry.category || entry.categoria || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate border-b border-white/5">
                    {entry.notes || entry.notas || entry.description || entry.descripcion || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium border-b border-white/5">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(entry);
                          router.push(`/accounting/${entry.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" fill="currentColor" fillOpacity={0.6} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" fill="currentColor" fillOpacity={0.6} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" fill="currentColor" fillOpacity={0.6} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEntry(null);
        }}
        title="Editar Movimiento"
        size="lg"
      >
        {selectedEntry && (
          <EntryForm
            initialData={selectedEntry}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedEntry(null);
            }}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEntry(null);
        }}
        title="Confirmar Eliminación"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar este movimiento contable?
          </p>
          {selectedEntry && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Fecha:</strong> {formatDate(selectedEntry.date || selectedEntry.fecha)}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Tipo:</strong> {getTypeLabel(selectedEntry.type || selectedEntry.tipo || "")}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Monto:</strong> {formatCurrency(selectedEntry.amount || selectedEntry.monto || 0)}
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedEntry(null);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

