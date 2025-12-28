"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useAuthStore } from "@/store/authStore";
import { validateDateRange, validatePositiveNumber, validateNonNegativeNumber } from "@/lib/validations";

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
    validity_date: "",
    scope: "",
    specifications: "",
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
        validity_date: initialData.validity_date?.split("T")[0] || "",
        scope: initialData.scope || "",
        specifications: initialData.specifications || "",
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones para campos que solo Direction puede modificar
    if (isDirection) {
      const amountValidation = validatePositiveNumber(formData.amount_total);
      if (!amountValidation.isValid) {
        newErrors.amount_total = amountValidation.error || "El monto total debe ser mayor a 0";
      }
      if (!formData.currency) {
        newErrors.currency = "La moneda es requerida";
      }
    }
    
    // Validar rango de fechas
    if (formData.start_date && formData.end_date) {
      const dateRangeValidation = validateDateRange(formData.start_date, formData.end_date);
      if (!dateRangeValidation.isValid) {
        newErrors.end_date = dateRangeValidation.error || "La fecha de fin debe ser posterior a la fecha de inicio";
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
      if (formData.validity_date) submitData.validity_date = formData.validity_date;
      if (formData.scope !== undefined) submitData.scope = formData.scope;
      if (formData.specifications !== undefined) submitData.specifications = formData.specifications;
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
            onChange={(e) => {
              setFormData({ ...formData, amount_total: parseFloat(e.target.value) || 0 });
              // Limpiar error si el campo cambia
              if (errors.amount_total) {
                setErrors({ ...errors, amount_total: "" });
              }
            }}
            onBlur={() => {
              setTouched({ ...touched, amount_total: true });
              const amountValidation = validatePositiveNumber(formData.amount_total);
              if (!amountValidation.isValid) {
                setErrors({ ...errors, amount_total: amountValidation.error || "El monto total debe ser mayor a 0" });
              } else {
                setErrors({ ...errors, amount_total: "" });
              }
            }}
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
            onChange={(e) => {
              setFormData({ ...formData, start_date: e.target.value });
              // Limpiar error de end_date si cambia start_date
              if (errors.end_date && formData.end_date) {
                const dateRangeValidation = validateDateRange(e.target.value, formData.end_date);
                if (dateRangeValidation.isValid) {
                  setErrors({ ...errors, end_date: "" });
                }
              }
            }}
            disabled={isLoading}
          />
          <Input
            label="Fecha de Fin"
            type="date"
            value={formData.end_date}
            onChange={(e) => {
              setFormData({ ...formData, end_date: e.target.value });
              // Limpiar error si el campo cambia
              if (errors.end_date) {
                setErrors({ ...errors, end_date: "" });
              }
            }}
            onBlur={() => {
              setTouched({ ...touched, end_date: true });
              if (formData.start_date && formData.end_date) {
                const dateRangeValidation = validateDateRange(formData.start_date, formData.end_date);
                if (!dateRangeValidation.isValid) {
                  setErrors({ ...errors, end_date: dateRangeValidation.error || "La fecha de fin debe ser posterior a la fecha de inicio" });
                } else {
                  setErrors({ ...errors, end_date: "" });
                }
              }
            }}
            error={errors.end_date}
            disabled={isLoading}
          />
          <Textarea
            label="Observaciones"
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            rows={4}
            disabled={isLoading}
          />
          <Input
            label="Fecha de Validez"
            type="date"
            value={formData.validity_date}
            onChange={(e) => setFormData({ ...formData, validity_date: e.target.value })}
            disabled={isLoading}
          />
          <Textarea
            label="Alcance"
            value={formData.scope}
            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
            rows={3}
            disabled={isLoading}
            placeholder="Descripción del alcance del contrato"
          />
          <Textarea
            label="Especificaciones"
            value={formData.specifications}
            onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
            rows={4}
            disabled={isLoading}
            placeholder="Especificaciones técnicas o condiciones del contrato"
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

