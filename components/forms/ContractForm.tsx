"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useAuthStore } from "@/store/authStore";

interface ContractFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ContractForm({ initialData, onSubmit, onCancel, isLoading }: ContractFormProps) {
  const user = useAuthStore.getState().user;
  const isDirection = user?.role?.name === "DIRECTION";
  const isAdministration = user?.role?.name === "ADMINISTRATION" || isDirection;

  const [formData, setFormData] = useState({
    amount_total: 0,
    currency: "ARS",
    payment_terms: "",
    file_url: "",
    start_date: "",
    end_date: "",
    observations: "",
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount_total: initialData.amount_total || 0,
        currency: initialData.currency || "ARS",
        payment_terms: initialData.payment_terms || "",
        file_url: initialData.file_url || "",
        start_date: initialData.start_date?.split("T")[0] || initialData.startDate?.split("T")[0] || "",
        end_date: initialData.end_date?.split("T")[0] || initialData.endDate?.split("T")[0] || "",
        observations: initialData.observations || "",
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones para campos que solo Direction puede modificar
    if (isDirection) {
      if (!formData.amount_total || formData.amount_total <= 0) {
        newErrors.amount_total = "El monto total debe ser mayor a 0";
      }
      if (!formData.currency) {
        newErrors.currency = "La moneda es requerida";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Preparar datos según permisos
    const submitData: any = {};

    // Solo Direction puede modificar amount_total y currency
    if (isDirection) {
      submitData.amount_total = formData.amount_total;
      submitData.currency = formData.currency;
    }

    // Administration y Direction pueden modificar otros campos
    if (isAdministration) {
      if (formData.payment_terms !== undefined) submitData.payment_terms = formData.payment_terms;
      if (formData.file_url !== undefined) submitData.file_url = formData.file_url;
      if (formData.start_date) submitData.start_date = formData.start_date;
      if (formData.end_date) submitData.end_date = formData.end_date;
      if (formData.observations !== undefined) submitData.observations = formData.observations;
    }

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campos solo para Direction */}
      {isDirection && (
        <>
          <Input
            label="Monto Total"
            type="number"
            step="0.01"
            value={formData.amount_total}
            onChange={(e) => setFormData({ ...formData, amount_total: parseFloat(e.target.value) || 0 })}
            error={errors.amount_total}
            required
            disabled={isLoading}
          />
          <Select
            label="Moneda"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            error={errors.currency}
            required
            disabled={isLoading}
          >
            <option value="ARS">ARS (Pesos Argentinos)</option>
            <option value="USD">USD (Dólares)</option>
          </Select>
        </>
      )}

      {/* Campos para Administration y Direction */}
      {isAdministration && (
        <>
          <Textarea
            label="Términos de Pago"
            value={formData.payment_terms}
            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
            rows={3}
            disabled={isLoading}
          />
          <Input
            label="URL del Archivo"
            type="url"
            value={formData.file_url}
            onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
            disabled={isLoading}
            placeholder="https://..."
          />
          <Input
            label="Fecha de Inicio"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            disabled={isLoading}
          />
          <Input
            label="Fecha de Fin"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            disabled={isLoading}
          />
          <Textarea
            label="Observaciones"
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            rows={4}
            disabled={isLoading}
          />
        </>
      )}

      {!isAdministration && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No tienes permisos para editar contratos. Solo Administración y Dirección pueden editar contratos.
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        {isAdministration && (
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
          </Button>
        )}
      </div>
    </form>
  );
}

