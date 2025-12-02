"use client";

import { useState, useEffect } from "react";
import { useCashboxStore, CashMovement } from "@/store/cashboxStore";
import { useSuppliers } from "@/hooks/api/suppliers";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

interface MovementFormProps {
  cashboxId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: CashMovement | null;
}

export function MovementForm({ cashboxId, onSuccess, onCancel, initialData }: MovementFormProps) {
  const [type, setType] = useState<"ingreso" | "egreso">(initialData?.type === "ingreso" || initialData?.type === "income" ? "ingreso" : "egreso");
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [supplierId, setSupplierId] = useState(initialData?.supplierId || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState(initialData?.notes || initialData?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createMovement, updateMovement } = useCashboxStore();
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    if (!date) {
      toast.error("La fecha es requerida");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type,
        amount: parseFloat(amount),
        supplierId: supplierId || undefined,
        category: category.trim() || undefined,
        date,
        notes: notes.trim() || undefined,
        description: notes.trim() || undefined,
      };

      if (initialData?.id) {
        await updateMovement(cashboxId, initialData.id, payload);
        toast.success("Movimiento actualizado");
      } else {
        await createMovement(cashboxId, payload);
        toast.success("Movimiento registrado");
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar movimiento:", error);
      toast.error(error.message || "Error al guardar el movimiento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? "Editar Movimiento" : "Nuevo Movimiento"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as "ingreso" | "egreso")}
                className="w-full px-3 py-2 border border-gray-300 rounded-pmd focus:outline-none focus:ring-2 focus:ring-pmd-gold focus:border-transparent"
                required
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Monto <span className="text-red-500">*</span>
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-pmd focus:outline-none focus:ring-2 focus:ring-pmd-gold focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-pmd focus:outline-none focus:ring-2 focus:ring-pmd-gold focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-pmd focus:outline-none focus:ring-2 focus:ring-pmd-gold focus:border-transparent"
                placeholder="Ej: Materiales, Servicios, etc."
              />
            </div>
          </div>

          <div>
            <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor
            </label>
            <select
              id="supplierId"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-pmd focus:outline-none focus:ring-2 focus:ring-pmd-gold focus:border-transparent"
              disabled={suppliersLoading}
            >
              <option value="">Seleccionar proveedor (opcional)</option>
              {suppliers?.map((supplier: any) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name || supplier.nombre || `Proveedor ${supplier.id.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-pmd focus:outline-none focus:ring-2 focus:ring-pmd-gold focus:border-transparent"
              placeholder="Descripción o notas adicionales del movimiento..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Guardando..." : initialData?.id ? "Actualizar" : "Crear Movimiento"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

