"use client";

import { useState, useEffect } from "react";
import { FormField, InputField, SelectField, TextareaField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useWorks } from "@/hooks/api/works";
import { useUsers } from "@/hooks/api/users";
import { useDocuments } from "@/hooks/api/documents";
import { useSuppliers } from "@/hooks/api/suppliers";

interface AlertFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  defaultWorkId?: string;
  defaultPersonId?: string;
  defaultDocumentId?: string;
}

const ALERT_TYPES = [
  { value: "obra", label: "Obra" },
  { value: "rrhh", label: "RRHH" },
  { value: "documentacion", label: "Documentación" },
  { value: "contable", label: "Contable" },
  { value: "seguro", label: "Seguro" },
  { value: "general", label: "General" },
];

// Backend severity enum: "info" | "warning" | "critical"
const SEVERITY_OPTIONS = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Advertencia" },
  { value: "critical", label: "Crítico" },
];

// Backend category enum - must match backend AlertCategory enum exactly
// Common categories (adjust based on actual backend enum):
const CATEGORY_OPTIONS = [
  { value: "work", label: "Obra" },
  { value: "supplier", label: "Proveedor" },
  { value: "document", label: "Documento" },
  { value: "accounting", label: "Contable" },
  { value: "cashbox", label: "Caja" },
  { value: "general", label: "General" },
];

export function AlertForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  defaultWorkId,
  defaultPersonId,
  defaultDocumentId,
}: AlertFormProps) {
  const { works } = useWorks();
  const { users } = useUsers();
  const { documents } = useDocuments();
  const { suppliers } = useSuppliers();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [severity, setSeverity] = useState<"info" | "warning" | "critical">("info");
  const [workId, setWorkId] = useState(defaultWorkId || "");
  const [supplierId, setSupplierId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "general");
      setSeverity(initialData.severity || "info");
      setWorkId(initialData.workId || defaultWorkId || "");
      setSupplierId(initialData.supplierId || "");
    } else {
      if (defaultWorkId) setWorkId(defaultWorkId);
    }
  }, [initialData, defaultWorkId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title || title.trim() === "") {
      newErrors.title = "El título es obligatorio";
    }

    if (title.length > 255) {
      newErrors.title = "El título no puede exceder 255 caracteres";
    }

    if (!category || category.trim() === "") {
      newErrors.category = "La categoría es obligatoria";
    }

    if (!severity || !["info", "warning", "critical"].includes(severity)) {
      newErrors.severity = "La severidad es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Construir payload exacto según backend DTO
    const payload: any = {
      title: title.trim(),
      category: category,
      severity: severity,
    };

    // Agregar campos opcionales
    if (description.trim()) payload.description = description.trim();
    if (workId) payload.workId = workId;
    if (supplierId) payload.supplierId = supplierId;

    await onSubmit(payload);
  };

  const workOptions = [
    { value: "", label: "Seleccionar obra" },
    ...(works?.map((work: any) => ({
      value: work.id,
      label: work.nombre || work.name || work.title || `Obra ${work.id.slice(0, 8)}`,
    })) || []),
  ];

  const userOptions = [
    { value: "", label: "Seleccionar empleado" },
    ...(users?.map((user: any) => ({
      value: user.id,
      label: user.fullName || user.name || user.nombre || `Usuario ${user.id.slice(0, 8)}`,
    })) || []),
  ];

  const documentOptions = [
    { value: "", label: "Seleccionar documento" },
    ...(documents?.map((doc: any) => ({
      value: doc.id,
      label: doc.name || doc.nombre || `Documento ${doc.id.slice(0, 8)}`,
    })) || []),
  ];

  const supplierOptions = [
    { value: "", label: "Seleccionar proveedor" },
    ...(suppliers?.map((sup: any) => ({
      value: sup.id,
      label: sup.nombre || sup.name || `Proveedor ${sup.id.slice(0, 8)}`,
    })) || []),
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      <InputField
        label="Título"
        type="text"
        value={title}
        onChange={(e) => {
          const value = e.target.value;
          if (value.length <= 255) {
            setTitle(value);
          }
        }}
        error={errors.title}
        required
        maxLength={255}
        placeholder="Título de la alerta (máximo 255 caracteres)"
      />

      <TextareaField
        label="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="Descripción detallada de la alerta"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <SelectField
          label="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORY_OPTIONS}
          error={errors.category}
          required
        />
        <SelectField
          label="Severidad"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as typeof severity)}
          options={SEVERITY_OPTIONS}
          error={errors.severity}
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <SelectField
          label="Obra (opcional)"
          value={workId}
          onChange={(e) => setWorkId(e.target.value)}
          options={workOptions}
          disabled={!!defaultWorkId}
        />
        <SelectField
          label="Proveedor (opcional)"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          options={supplierOptions}
        />
      </div>

      <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear Alerta"}
        </Button>
      </div>
    </form>
  );
}

