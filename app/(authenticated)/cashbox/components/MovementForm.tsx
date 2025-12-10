"use client";

import { useState, useEffect } from "react";
import { useCashboxStore, CashMovement } from "@/store/cashboxStore";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useWorks } from "@/hooks/api/works";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface MovementFormProps {
  cashboxId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: CashMovement | null;
}

export function MovementForm({ cashboxId, onSuccess, onCancel, initialData }: MovementFormProps) {
  const [movementType, setMovementType] = useState<"ingreso" | "egreso">(
    initialData?.type === "ingreso" || initialData?.type === "income" ? "ingreso" : "egreso"
  );
  const [documentType, setDocumentType] = useState<"factura" | "comprobante" | null>(
    initialData?.typeDocument || null
  );
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [supplierId, setSupplierId] = useState(initialData?.supplierId || "");
  const [workId, setWorkId] = useState(initialData?.workId || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [date, setDate] = useState(
    initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState(initialData?.notes || initialData?.description || "");
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || "");
  const [responsible, setResponsible] = useState(initialData?.responsible || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createMovement, updateMovement } = useCashboxStore();
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { works, isLoading: worksLoading } = useWorks();
  const toast = useToast();

  // Resetear documentType cuando cambia movementType
  useEffect(() => {
    if (movementType === "ingreso") {
      setDocumentType(null);
      setInvoiceNumber("");
      setSupplierId("");
    }
  }, [movementType]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0";
    }

    if (!date) {
      newErrors.date = "La fecha es requerida";
    }

    // Validaciones para Egreso con Factura
    if (movementType === "egreso" && documentType === "factura") {
      if (!invoiceNumber || invoiceNumber.trim() === "") {
        newErrors.invoiceNumber = "El número de factura es obligatorio";
      }
      if (!supplierId || supplierId.trim() === "") {
        newErrors.supplierId = "El proveedor es obligatorio para facturas";
      }
      if (!workId || workId.trim() === "") {
        newErrors.workId = "La obra es obligatoria para facturas";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      // Construir payload exacto según CreateCashMovementDto del backend
      const payload: any = {
        cashbox_id: cashboxId, // required, UUID
        type: movementType === "ingreso" ? "income" : "expense", // required, CashMovementType enum
        amount: parseFloat(amount), // required, number
        currency: "ARS", // required, "ARS" | "USD"
        date: new Date(date).toISOString(), // required, ISO8601
      };

      // Campos opcionales
      if (notes.trim()) payload.description = notes.trim();

      // Campos específicos para Egreso (expense)
      if (movementType === "egreso") {
        // Si hay expense_id, agregarlo
        // Si hay income_id, agregarlo (aunque no debería haberlo en egreso)
        // El backend maneja expense_id e income_id según el tipo
      }

      // Campos específicos para Ingreso (income)
      if (movementType === "ingreso") {
        // Si hay income_id, agregarlo
        // Si hay expense_id, agregarlo (aunque no debería haberlo en ingreso)
      }

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
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {/* Tipo de Movimiento */}
          <FormField label="Tipo de movimiento" required>
            <Select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as "ingreso" | "egreso")}
              required
            >
              <option value="ingreso">Ingreso (Refuerzo)</option>
              <option value="egreso">Egreso</option>
            </Select>
          </FormField>

          {/* Tipo de Comprobante (solo para Egreso) */}
          {movementType === "egreso" && (
            <FormField label="Tipo de comprobante" required>
              <Select
                value={documentType || ""}
                onChange={(e) => setDocumentType(e.target.value as "factura" | "comprobante" | null)}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="factura">Factura (compra en blanco)</option>
                <option value="comprobante">Comprobante / Ticket (compra informal)</option>
              </Select>
            </FormField>
          )}

          {/* Monto */}
          <FormField label="Monto" required error={errors.amount}>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </FormField>

          {/* Fecha */}
          <FormField label="Fecha" required error={errors.date}>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </FormField>

          {/* Número de Factura (solo para Factura) */}
          {movementType === "egreso" && documentType === "factura" && (
            <FormField label="Número de factura" required error={errors.invoiceNumber}>
              <Input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Ej: 0001-00001234"
                required
              />
            </FormField>
          )}

          {/* Proveedor (obligatorio para Factura, opcional para Comprobante) */}
          {movementType === "egreso" && documentType && (
            <FormField
              label="Proveedor"
              required={documentType === "factura"}
              error={errors.supplierId}
            >
              <Select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                disabled={suppliersLoading}
                required={documentType === "factura"}
              >
                <option value="">Seleccionar proveedor{documentType === "comprobante" ? " (opcional)" : ""}</option>
                {suppliers?.map((supplier: any) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name || supplier.nombre || `Proveedor ${supplier.id.slice(0, 8)}`}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          {/* Obra (obligatoria para Factura) */}
          {movementType === "egreso" && documentType === "factura" && (
            <FormField label="Obra" required error={errors.workId}>
              <Select
                value={workId}
                onChange={(e) => setWorkId(e.target.value)}
                disabled={worksLoading}
                required
              >
                <option value="">Seleccionar obra</option>
                {works?.map((work: any) => (
                  <option key={work.id} value={work.id}>
                    {work.name || work.nombre || work.title || `Obra ${work.id.slice(0, 8)}`}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          {/* Responsable (solo para Ingreso/Refuerzo) */}
          {movementType === "ingreso" && (
            <FormField label="Responsable (opcional)">
              <Input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Nombre del responsable del refuerzo"
              />
            </FormField>
          )}

          {/* Categoría */}
          <FormField label="Categoría">
            <Input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ej: Materiales, Servicios, etc."
            />
          </FormField>

          {/* Observaciones/Notas */}
          <FormField label={movementType === "ingreso" ? "Observaciones (opcional)" : "Notas"}>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={
                movementType === "ingreso"
                  ? "Observaciones sobre el refuerzo..."
                  : "Descripción o notas adicionales del movimiento..."
              }
            />
          </FormField>

          {/* Botones */}
          <div style={{ display: "flex", gap: "var(--space-sm)", paddingTop: "var(--space-md)" }}>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{ flex: 1 }}
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
