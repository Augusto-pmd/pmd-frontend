"use client";

import { useState, useEffect } from "react";
import { useCashboxStore } from "@/store/cashboxStore";
import { useWorks } from "@/hooks/api/works";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

interface CashboxFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<{
    id: string;
    name: string;
    workId: string;
    notes: string;
  }>;
}

export function CashboxForm({ onSuccess, onCancel, initialData }: CashboxFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [workId, setWorkId] = useState(initialData?.workId || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createCashbox, updateCashbox } = useCashboxStore();
  const { works, isLoading: worksLoading } = useWorks();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("El nombre de la caja es requerido");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        workId: workId || undefined,
        notes: notes.trim() || undefined,
      };

      if (initialData?.id) {
        await updateCashbox(initialData.id, payload);
        toast.success("Caja actualizada correctamente");
      } else {
        await createCashbox(payload);
        toast.success("Caja creada correctamente");
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Error al guardar caja:", error);
      toast.error(error.message || "Error al guardar la caja");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? "Editar Caja" : "Nueva Caja"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la caja <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-pmd focus:outline-none focus:ring-2 focus:ring-pmd-gold focus:border-transparent"
              placeholder="Ej: Caja Principal"
              required
            />
          </div>

          <div>
            <label htmlFor="workId" className="block text-sm font-medium text-gray-700 mb-1">
              Obra vinculada
            </label>
            <select
              id="workId"
              value={workId}
              onChange={(e) => setWorkId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-pmd focus:outline-none focus:ring-2 focus:ring-pmd-gold focus:border-transparent"
              disabled={worksLoading}
            >
              <option value="">Seleccionar obra (opcional)</option>
              {works?.map((work: any) => (
                <option key={work.id} value={work.id}>
                  {work.title || work.name || work.nombre || `Obra ${work.id.slice(0, 8)}`}
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
              placeholder="Notas adicionales sobre la caja..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Guardando..." : initialData?.id ? "Actualizar" : "Crear Caja"}
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

