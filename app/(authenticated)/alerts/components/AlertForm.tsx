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

const SEVERITY_OPTIONS = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
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

  const [message, setMessage] = useState("");
  const [type, setType] = useState<"seguro" | "documentacion" | "obra" | "contable" | "general" | "rrhh">("general");
  const [severity, setSeverity] = useState<"alta" | "media" | "baja">("media");
  const [workId, setWorkId] = useState(defaultWorkId || "");
  const [personId, setPersonId] = useState(defaultPersonId || "");
  const [documentId, setDocumentId] = useState(defaultDocumentId || "");
  const [supplierId, setSupplierId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setMessage(initialData.message || "");
      setType(initialData.type || "general");
      setSeverity(initialData.severity || "media");
      setWorkId(initialData.workId || defaultWorkId || "");
      setPersonId(initialData.personId || defaultPersonId || "");
      setDocumentId(initialData.documentId || defaultDocumentId || "");
      setSupplierId(initialData.supplierId || "");
      setTitle(initialData.title || "");
      setNotes(initialData.notes || "");
      setDate(initialData.date ? initialData.date.split("T")[0] : new Date().toISOString().split("T")[0]);
    } else {
      if (defaultWorkId) setWorkId(defaultWorkId);
      if (defaultPersonId) setPersonId(defaultPersonId);
      if (defaultDocumentId) setDocumentId(defaultDocumentId);
    }
  }, [initialData, defaultWorkId, defaultPersonId, defaultDocumentId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!message || message.trim() === "") {
      newErrors.message = "El mensaje es obligatorio";
    }

    if (!type || type.trim() === "") {
      newErrors.type = "El tipo es obligatorio";
    }

    if (!severity || !["alta", "media", "baja"].includes(severity)) {
      newErrors.severity = "La severidad es obligatoria";
    }

    if (!date || date.trim() === "") {
      newErrors.date = "La fecha es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Construir payload exacto según DTO
    const payload: any = {
      message: message.trim(),
      type,
      severity,
      date,
      read: false,
    };

    // Agregar campos opcionales
    if (title.trim()) payload.title = title.trim();
    if (workId) payload.workId = workId;
    if (personId) payload.personId = personId;
    if (documentId) payload.documentId = documentId;
    if (supplierId) payload.supplierId = supplierId;
    if (notes.trim()) payload.notes = notes.trim();

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
        label="Título (opcional)"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título breve de la alerta"
      />

      <TextareaField
        label="Mensaje"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        error={errors.message}
        required
        rows={3}
        placeholder="Descripción detallada de la alerta"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <SelectField
          label="Tipo"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          options={ALERT_TYPES}
          error={errors.type}
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

      <InputField
        label="Fecha"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
        required
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <SelectField
          label="Obra (opcional)"
          value={workId}
          onChange={(e) => setWorkId(e.target.value)}
          options={workOptions}
          disabled={!!defaultWorkId}
        />
        <SelectField
          label="Empleado (opcional)"
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
          options={userOptions}
          disabled={!!defaultPersonId}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <SelectField
          label="Documento (opcional)"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          options={documentOptions}
          disabled={!!defaultDocumentId}
        />
        <SelectField
          label="Proveedor (opcional)"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          options={supplierOptions}
        />
      </div>

      <TextareaField
        label="Notas internas (opcional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Notas adicionales sobre la alerta"
      />

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

