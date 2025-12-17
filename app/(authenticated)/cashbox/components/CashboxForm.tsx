"use client";

import { useState } from "react";
import { useCashboxStore } from "@/store/cashboxStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { mapCreateCashboxPayload } from "@/lib/payload-mappers";

interface CashboxFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CashboxForm({ onSuccess, onCancel }: CashboxFormProps) {
  const [opening_date, setOpeningDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createCashbox } = useCashboxStore();
  const user = useAuthStore.getState().user;
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!opening_date) {
      toast.error("La fecha de apertura es requerida");
      return;
    }

    if (!user?.id) {
      toast.error("No se pudo obtener el usuario actual");
      return;
    }

    setIsSubmitting(true);
    try {
      // Usar función de mapeo para alinear EXACTAMENTE con el DTO del backend
      const payload = mapCreateCashboxPayload(
        { opening_date },
        user.id
      );

      await createCashbox(payload);
      toast.success("Caja creada correctamente");
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
        <CardTitle>Nueva Caja</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="opening_date" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Apertura <span className="text-red-500">*</span>
            </label>
            <input
              id="opening_date"
              type="date"
              value={opening_date}
              onChange={(e) => setOpeningDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-pmd focus:outline-none focus:ring-2 focus:ring-pmd-gold focus:border-transparent"
              required
            />
          </div>

          <div className="text-sm text-gray-600">
            <p>Usuario: <strong>{user?.fullName || user?.email || "N/A"}</strong></p>
            <p className="text-xs text-gray-500 mt-1">La caja se creará asociada a tu usuario</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Guardando..." : "Crear Caja"}
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

