"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Expense, CreateExpenseData } from "@/lib/types/expense";
import { validatePositiveNumber, validateRequired } from "@/lib/validations";

interface ExpenseFormProps {
  initialData?: Expense | null;
  onSubmit: (data: CreateExpenseData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ExpenseForm({ initialData, onSubmit, onCancel, isLoading }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    amount: 0,
    description: "",
    category: "",
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
        description: initialData.description || "",
        category: initialData.category || "",
        date: typeof initialData.date === 'string' ? initialData.date.split("T")[0] : initialData.date instanceof Date ? initialData.date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      } as any);
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
    
    const categoryValidation = validateRequired(formData.category);
    if (!categoryValidation.isValid) {
      newErrors.category = categoryValidation.error || "La categoría es obligatoria";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData as CreateExpenseData);
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
        label="Categoría"
        value={formData.category}
        onChange={(e) => {
          setFormData({ ...formData, category: e.target.value });
          if (errors.category) setErrors({ ...errors, category: "" });
        }}
        onBlur={() => {
          setTouched({ ...touched, category: true });
          const categoryValidation = validateRequired(formData.category);
          if (!categoryValidation.isValid) {
            setErrors({ ...errors, category: categoryValidation.error || "La categoría es obligatoria" });
          } else {
            setErrors({ ...errors, category: "" });
          }
        }}
        error={errors.category}
        required
      />
      <Input
        label="Fecha"
        type="date"
        value={typeof formData.date === 'string' ? formData.date : formData.date instanceof Date ? formData.date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
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
        <Button type="submit" variant="primary" loading={isLoading} disabled={isLoading}>
          {initialData ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
