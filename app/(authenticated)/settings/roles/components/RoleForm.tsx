"use client";

import { useState, useEffect } from "react";
import { FormField, InputField, TextareaField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useRolesStore } from "@/store/rolesStore";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";

interface RoleFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RoleForm({ initialData, onSubmit, onCancel, isLoading }: RoleFormProps) {
  const { permissions, fetchPermissions } = useRolesStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setSelectedPermissions(initialData.permissions || []);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name || name.trim() === "") {
      newErrors.name = "El nombre del rol es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      permissions: selectedPermissions,
    };

    await onSubmit(payload);
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const toggleAllInCategory = (category: string) => {
    const categoryPermissions = permissions.filter((p) => p.startsWith(category));
    const allSelected = categoryPermissions.every((p) => selectedPermissions.includes(p));
    
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !p.startsWith(category)));
    } else {
      setSelectedPermissions((prev) => {
        const newPerms = [...prev];
        categoryPermissions.forEach((p) => {
          if (!newPerms.includes(p)) {
            newPerms.push(p);
          }
        });
        return newPerms;
      });
    }
  };

  const getCategoryPermissions = (category: string) => {
    return permissions.filter((p) => p.startsWith(category));
  };

  const categories = [
    { key: "works", label: "Obras" },
    { key: "staff", label: "RRHH" },
    { key: "suppliers", label: "Proveedores" },
    { key: "documents", label: "Documentación" },
    { key: "accounting", label: "Contabilidad" },
    { key: "cashbox", label: "Cajas" },
    { key: "clients", label: "Clientes" },
    { key: "alerts", label: "Alertas" },
    { key: "audit", label: "Auditoría" },
    { key: "settings", label: "Configuración" },
    { key: "users", label: "Usuarios" },
    { key: "roles", label: "Roles" },
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      <InputField
        label="Nombre del Rol"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
        placeholder="Ej: Administrador, Operador, Auditor"
      />

      <TextareaField
        label="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="Descripción del rol y sus responsabilidades"
      />

      <div>
        <label style={{ font: "var(--font-label)", color: "var(--apple-text-primary)", marginBottom: "var(--space-sm)", display: "block" }}>
          Permisos
        </label>
        <div style={{ 
          maxHeight: "400px", 
          overflowY: "auto", 
          border: "1px solid var(--apple-border)", 
          borderRadius: "var(--radius-md)",
          padding: "var(--space-md)"
        }}>
          {categories.map((category) => {
            const categoryPerms = getCategoryPermissions(category.key);
            if (categoryPerms.length === 0) return null;

            const allSelected = categoryPerms.every((p) => selectedPermissions.includes(p));
            const someSelected = categoryPerms.some((p) => selectedPermissions.includes(p));

            return (
              <div key={category.key} style={{ marginBottom: "var(--space-lg)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-sm)" }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={() => toggleAllInCategory(category.key)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <strong style={{ font: "var(--font-label)", color: "var(--apple-text-primary)" }}>
                    {category.label}
                  </strong>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginLeft: "24px" }}>
                  {categoryPerms.map((permission) => (
                    <div key={permission} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "14px", color: "var(--apple-text-secondary)" }}>
                        {permission}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {selectedPermissions.length > 0 && (
          <p style={{ fontSize: "13px", color: "var(--apple-text-secondary)", marginTop: "var(--space-sm)" }}>
            {selectedPermissions.length} permiso{selectedPermissions.length !== 1 ? "s" : ""} seleccionado{selectedPermissions.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear Rol"}
        </Button>
      </div>
    </form>
  );
}

