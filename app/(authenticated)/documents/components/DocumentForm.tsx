"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useWorks } from "@/hooks/api/works";
import { useUsers } from "@/hooks/api/users";

interface DocumentFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  defaultWorkId?: string;
}

const DOCUMENT_TYPES = [
  "Planos",
  "Memoria descriptiva",
  "Memoria técnica",
  "Contrato",
  "Permisos",
  "Legales",
  "Especificaciones",
  "Presupuesto",
  "Otro",
];

const DOCUMENT_STATUSES = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en revisión", label: "En Revisión" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
];

export function DocumentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  defaultWorkId,
}: DocumentFormProps) {
  const { works } = useWorks();
  const { users } = useUsers();
  const [formData, setFormData] = useState({
    workId: defaultWorkId || "",
    type: "",
    name: "",
    version: "",
    status: "pendiente" as "aprobado" | "en revisión" | "pendiente" | "rechazado",
    uploadedBy: "",
    notes: "",
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        workId: initialData.workId || defaultWorkId || "",
        type: initialData.type || "",
        name: initialData.name || "",
        version: initialData.version || "",
        status: initialData.status || "pendiente",
        uploadedBy: initialData.uploadedBy || "",
        notes: initialData.notes || "",
      });
    } else if (defaultWorkId) {
      setFormData((prev: typeof formData) => ({ ...prev, workId: defaultWorkId }));
    }
  }, [initialData, defaultWorkId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.workId?.trim()) {
      newErrors.workId = "La obra es obligatoria";
    }

    if (!formData.type?.trim()) {
      newErrors.type = "El tipo es obligatorio";
    }

    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: any = {
      workId: formData.workId.trim(),
      type: formData.type.trim(),
      name: formData.name.trim(),
      version: formData.version?.trim() || undefined,
      status: formData.status,
      uploadedBy: formData.uploadedBy?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };

    // Limpiar campos undefined
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === "") {
        delete payload[key];
      }
    });

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Obra *
        </label>
        <select
          value={formData.workId}
          onChange={(e) => setFormData({ ...formData, workId: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          required
          disabled={!!defaultWorkId}
        >
          <option value="">Seleccionar obra</option>
          {works.map((work: any) => {
            const workName = work.name || work.title || work.nombre || work.id;
            return (
              <option key={work.id} value={work.id}>
                {workName}
              </option>
            );
          })}
        </select>
        {errors.workId && <p className="mt-1 text-sm text-red-600">{errors.workId}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo *
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          required
        >
          <option value="">Seleccionar tipo</option>
          {DOCUMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
      </div>

      <Input
        label="Nombre del documento *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
        placeholder="Ej: Planta baja – V1.2"
      />

      <Input
        label="Versión"
        value={formData.version}
        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
        placeholder="Ej: 1.2, v2.0, draft"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value as typeof formData.status })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
        >
          {DOCUMENT_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
        <select
          value={formData.uploadedBy}
          onChange={(e) => setFormData({ ...formData, uploadedBy: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
        >
          <option value="">Seleccionar responsable</option>
          {users.map((user: any) => {
            const userName = user.fullName || user.name || user.nombre || user.id;
            return (
              <option key={user.id} value={user.id}>
                {userName}
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          rows={3}
          placeholder="Notas adicionales sobre el documento"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Subir"}
        </Button>
      </div>
    </form>
  );
}

