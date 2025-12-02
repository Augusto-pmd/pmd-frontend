"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useWorks } from "@/hooks/api/works";

interface ClientFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClientForm({ initialData, onSubmit, onCancel, isLoading }: ClientFormProps) {
  const { works } = useWorks();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    status: "activo" as "activo" | "inactivo",
    projects: [] as string[],
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        notes: initialData.notes || "",
        status: initialData.status || "activo",
        projects: initialData.projects || [],
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    
    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "El formato del teléfono no es válido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: any = {
      name: formData.name.trim(),
      email: formData.email?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      address: formData.address?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      status: formData.status,
      projects: formData.projects.length > 0 ? formData.projects : undefined,
    };

    // Limpiar campos undefined
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === "") {
        delete payload[key];
      }
    });

    await onSubmit(payload);
  };

  const toggleProject = (workId: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      projects: prev.projects.includes(workId)
        ? prev.projects.filter((id: string) => id !== workId)
        : [...prev.projects, workId],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
        placeholder="Nombre completo del cliente"
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        placeholder="cliente@ejemplo.com"
      />

      <Input
        label="Teléfono"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        error={errors.phone}
        placeholder="+54 9 11 1234-5678"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          rows={3}
          placeholder="Dirección completa del cliente"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notas internas</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          rows={3}
          placeholder="Notas adicionales sobre el cliente"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as "activo" | "inactivo" })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Obras Vinculadas</label>
        <div className="border border-gray-300 rounded-pmd p-4 max-h-48 overflow-y-auto">
          {works.length === 0 ? (
            <p className="text-sm text-gray-500">No hay obras disponibles</p>
          ) : (
            <div className="space-y-2">
              {works.map((work: any) => {
                const workName = work.name || work.title || work.nombre || work.id;
                const isSelected = formData.projects.includes(work.id);
                return (
                  <label
                    key={work.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProject(work.id)}
                      className="rounded border-gray-300 text-pmd-gold focus:ring-pmd-gold"
                    />
                    <span className="text-sm text-gray-700">{workName}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        {formData.projects.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            {formData.projects.length} obra{formData.projects.length !== 1 ? "s" : ""} seleccionada
            {formData.projects.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-4">
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

