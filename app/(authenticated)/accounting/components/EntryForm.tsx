"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, InputField, SelectField, TextareaField } from "@/components/ui/FormField";
import { useWorks } from "@/hooks/api/works";
import { useSuppliers } from "@/hooks/api/suppliers";
import { normalizeId } from "@/lib/normalizeId";

interface EntryFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EntryForm({ initialData, onSubmit, onCancel, isLoading }: EntryFormProps) {
  const { works, isLoading: worksLoading } = useWorks();
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();
  
  const [date, setDate] = useState("");
  const [type, setType] = useState<"ingreso" | "egreso" | "income" | "expense">("egreso");
  const [workId, setWorkId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      // Normalizar datos del backend
      const fecha = initialData.date || initialData.fecha || "";
      setDate(fecha.split("T")[0] || "");
      setWorkId(normalizeId(initialData.workId || initialData.obraId));
      setSupplierId(normalizeId(initialData.supplierId || initialData.proveedorId));
      const tipo = initialData.type || initialData.tipo || "egreso";
      setType(tipo === "ingreso" ? "income" : tipo === "egreso" ? "expense" : tipo);
      setAmount((initialData.amount || initialData.monto || 0).toString());
      setCategory(initialData.category || initialData.categoria || "");
      setNotes(initialData.notes || initialData.notas || initialData.description || initialData.descripcion || "");
      setInvoiceNumber(initialData.invoiceNumber || "");
    } else {
      // Establecer fecha por defecto a hoy
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!date || date.trim() === "") {
      newErrors.date = "La fecha es obligatoria";
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0";
    }
    
    if (!workId || workId.trim() === "") {
      newErrors.workId = "La obra es obligatoria";
    }
    
    // Si es egreso y tiene invoiceNumber, validar que tenga proveedor
    if (type === "egreso" || type === "expense") {
      if (invoiceNumber && invoiceNumber.trim() !== "" && (!supplierId || supplierId.trim() === "")) {
        newErrors.supplierId = "El proveedor es obligatorio cuando hay número de factura";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Preparar payload exacto según DTO del backend
    const payload: any = {
      date: date,
      type: type === "ingreso" ? "income" : type === "egreso" ? "expense" : type,
      workId: workId || undefined,
      amount: parseFloat(amount),
      category: category.trim() || undefined,
      notes: notes.trim() || undefined,
      description: notes.trim() || undefined,
    };

    // Agregar proveedor si está seleccionado
    if (supplierId && supplierId.trim() !== "") {
      payload.supplierId = supplierId;
    }

    // Agregar número de factura si está presente
    if (invoiceNumber && invoiceNumber.trim() !== "") {
      payload.invoiceNumber = invoiceNumber.trim();
    }

    // Limpiar campos undefined
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === "") {
        delete payload[key];
      }
    });

    await onSubmit(payload);
  };

  const typeOptions = [
    { value: "egreso", label: "Egreso" },
    { value: "ingreso", label: "Ingreso" },
  ];

  const categoryOptions = [
    { value: "", label: "Seleccionar categoría" },
    { value: "materiales", label: "Materiales" },
    { value: "mano-de-obra", label: "Mano de obra" },
    { value: "honorarios", label: "Honorarios" },
    { value: "impuestos", label: "Impuestos" },
    { value: "servicios", label: "Servicios" },
    { value: "alquileres", label: "Alquileres" },
    { value: "combustible", label: "Combustible" },
    { value: "otros", label: "Otros" },
  ];

  const workOptions = [
    { value: "", label: "Seleccionar obra" },
    ...(works?.map((work: any) => ({
      value: normalizeId(work.id),
      label: work.nombre || work.name || work.title || `Obra ${work.id.slice(0, 8)}`,
    })) || []),
  ];

  const supplierOptions = [
    { value: "", label: "Seleccionar proveedor" },
    ...(suppliers?.map((sup: any) => ({
      value: normalizeId(sup.id),
      label: sup.nombre || sup.name || `Proveedor ${sup.id.slice(0, 8)}`,
    })) || []),
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <InputField
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          required
        />
        <SelectField
          label="Tipo de movimiento"
          value={type}
          onChange={(e) => setType(e.target.value as "ingreso" | "egreso" | "income" | "expense")}
          options={typeOptions}
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <SelectField
          label="Obra"
          value={workId}
          onChange={(e) => setWorkId(e.target.value)}
          options={workOptions}
          error={errors.workId}
          required
          disabled={worksLoading}
        />
        <SelectField
          label="Proveedor"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          options={supplierOptions}
          error={errors.supplierId}
          disabled={suppliersLoading}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <InputField
          label="Monto"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          required
          placeholder="0.00"
        />
        <SelectField
          label="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryOptions}
        />
      </div>

      {(type === "egreso" || type === "expense") && (
        <InputField
          label="Número de factura (opcional)"
          type="text"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="Ej: 0001-00001234"
        />
      )}

      <TextareaField
        label="Notas / Descripción"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Notas adicionales sobre el movimiento contable"
      />

      <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear Movimiento"}
        </Button>
      </div>
    </form>
  );
}

