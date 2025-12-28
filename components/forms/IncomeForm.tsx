"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { validatePositiveNumber, validateRequired } from "@/lib/validations";
import { IncomeType, PaymentMethod } from "@/lib/types/income";

interface IncomeFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function IncomeForm({ initialData, onSubmit, onCancel, isLoading }: IncomeFormProps) {
  const [formData, setFormData] = useState({
    amount: 0,
    description: "",
    source: "",
    type: IncomeType.ADVANCE,
    payment_method: "",
    date: new Date().toISOString().split("T")[0],
    workId: "",
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: initialData.date?.split("T")[0] || new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    const amountValidation = validatePositiveNumber(formData.amount);
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error || "El monto debe ser mayor que 0";
    }
    
    const descriptionValidation = validateRequired(formData.description);
    if (!descriptionValidation.isValid) {
      newErrors.description = descriptionValidation.error || "La descripción es obligatoria";
    }
    
    const sourceValidation = validateRequired(formData.source);
    if (!sourceValidation.isValid) {
      newErrors.source = sourceValidation.error || "La fuente es obligatoria";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Monto"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={(e) => {
          setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 });
          if (errors.amount) setErrors({ ...errors, amount: "" });
        }}
        onBlur={() => {
          setTouched({ ...touched, amount: true });
          const amountValidation = validatePositiveNumber(formData.amount);
          if (!amountValidation.isValid) {
            setErrors({ ...errors, amount: amountValidation.error || "El monto debe ser mayor que 0" });
          } else {
            setErrors({ ...errors, amount: "" });
          }
        }}
        error={errors.amount}
        required
      />
      <Input
        label="Descripción"
        value={formData.description}
        onChange={(e) => {
          setFormData({ ...formData, description: e.target.value });
          if (errors.description) setErrors({ ...errors, description: "" });
        }}
        onBlur={() => {
          setTouched({ ...touched, description: true });
          const descriptionValidation = validateRequired(formData.description);
          if (!descriptionValidation.isValid) {
            setErrors({ ...errors, description: descriptionValidation.error || "La descripción es obligatoria" });
          } else {
            setErrors({ ...errors, description: "" });
          }
        }}
        error={errors.description}
        required
      />
      <Input
        label="Fuente"
        value={formData.source}
        onChange={(e) => {
          setFormData({ ...formData, source: e.target.value });
          if (errors.source) setErrors({ ...errors, source: "" });
        }}
        onBlur={() => {
          setTouched({ ...touched, source: true });
          const sourceValidation = validateRequired(formData.source);
          if (!sourceValidation.isValid) {
            setErrors({ ...errors, source: sourceValidation.error || "La fuente es obligatoria" });
          } else {
            setErrors({ ...errors, source: "" });
          }
        }}
        error={errors.source}
        required
      />
      <Select
        label="Tipo de ingreso"
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value as IncomeType })}
        required
      >
        <option value={IncomeType.ADVANCE}>Anticipo</option>
        <option value={IncomeType.CERTIFICATION}>Certificación</option>
        <option value={IncomeType.FINAL_PAYMENT}>Pago Final</option>
        <option value={IncomeType.ADJUSTMENT}>Ajuste</option>
        <option value={IncomeType.REIMBURSEMENT}>Reembolso</option>
        <option value={IncomeType.OTHER}>Otro</option>
      </Select>
      <Select
        label="Método de pago"
        value={formData.payment_method || ""}
        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value || undefined })}
      >
        <option value="">Seleccionar método</option>
        <option value={PaymentMethod.TRANSFER}>Transferencia</option>
        <option value={PaymentMethod.CHECK}>Cheque</option>
        <option value={PaymentMethod.CASH}>Efectivo</option>
        <option value={PaymentMethod.PAYMENT_LINK}>Link de pago</option>
      </Select>
      <Input
        label="Fecha"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />
      <Input
        label="ID de Obra (opcional)"
        value={formData.workId}
        onChange={(e) => setFormData({ ...formData, workId: e.target.value })}
      />
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}

