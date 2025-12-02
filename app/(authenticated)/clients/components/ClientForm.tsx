"use client";

import { useState, useEffect } from "react";
import { InputField, SelectField, TextareaField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useWorks } from "@/hooks/api/works";
import styles from "@/components/ui/form.module.css";

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

  const statusOptions = [
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" },
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <InputField
        label="Nombre"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="Nombre completo del cliente"
      />

      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        placeholder="cliente@ejemplo.com"
      />

      <InputField
        label="Teléfono"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        error={errors.phone}
        placeholder="+54 9 11 1234-5678"
      />

      <TextareaField
        label="Dirección"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        rows={3}
        placeholder="Dirección completa del cliente"
      />

      <TextareaField
        label="Notas internas"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={3}
        placeholder="Notas adicionales sobre el cliente"
      />

      <SelectField
        label="Estado"
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value as "activo" | "inactivo" })}
        options={statusOptions}
      />

      <div className={styles.formField}>
        <label className={styles.label}>Obras Vinculadas</label>
        <div
          style={{
            border: "1px solid var(--apple-border-strong)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-md)",
            maxHeight: "192px",
            overflowY: "auto",
            backgroundColor: "var(--apple-surface)",
          }}
        >
          {works.length === 0 ? (
            <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)", margin: 0 }}>
              No hay obras disponibles
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
              {works.map((work: any) => {
                const workName = work.name || work.title || work.nombre || work.id;
                const isSelected = formData.projects.includes(work.id);
                return (
                  <label
                    key={work.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-sm)",
                      cursor: "pointer",
                      padding: "var(--space-xs) var(--space-sm)",
                      borderRadius: "var(--radius-md)",
                      transition: "background-color 200ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--apple-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProject(work.id)}
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                        accentColor: "var(--apple-blue)",
                      }}
                    />
                    <span style={{ font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
                      {workName}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        {formData.projects.length > 0 && (
          <p
            style={{
              marginTop: "var(--space-xs)",
              fontSize: "13px",
              color: "var(--apple-text-secondary)",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            {formData.projects.length} obra{formData.projects.length !== 1 ? "s" : ""} seleccionada
            {formData.projects.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-sm)" }}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="outline" disabled={isLoading}>
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}

