"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { mapCreateSupplierPayload } from "@/lib/payload-mappers";
import { Supplier, CreateSupplierData, UpdateSupplierData } from "@/lib/types/supplier";

interface SupplierFormProps {
  initialData?: Supplier | null;
  onSubmit: (data: CreateSupplierData | UpdateSupplierData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SupplierForm({ initialData, onSubmit, onCancel, isLoading }: SupplierFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    name: "",
    cuit: "",
    email: "",
    telefono: "",
    phone: "",
    direccion: "",
    address: "",
    contacto: "",
    contactName: "",
    existstatus: "provisional", // Backend enum: ["provisional", "approved", "blocked", "rejected"]
    notes: "",
    notas: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      // Normalizar datos del backend (puede venir como name o nombre)
      setFormData({
        nombre: initialData.nombre || initialData.name || "",
        name: initialData.name || initialData.nombre || "",
        cuit: initialData.cuit || initialData.CUIT || "",
        email: initialData.email || "",
        telefono: initialData.telefono || initialData.phone || "",
        phone: initialData.phone || initialData.telefono || "",
        direccion: initialData.direccion || initialData.address || "",
        address: initialData.address || initialData.direccion || "",
        contacto: initialData.contacto || initialData.contact || initialData.contactName || "",
        contactName: initialData.contactName || initialData.contact || initialData.contacto || "",
        existstatus: initialData.existstatus || initialData.status || initialData.estado || "provisional",
        notes: initialData.notes || initialData.notas || "",
        notas: initialData.notas || initialData.notes || "",
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validación obligatoria: nombre
    const nombre = formData.nombre || formData.name;
    if (!nombre?.trim()) {
      newErrors.nombre = "El nombre o razón social es obligatorio";
    }
    
    // Validar email si está presente
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    
    // Validar CUIT si está presente (formato básico: XX-XXXXXXXX-X)
    if (formData.cuit && !/^\d{2}-?\d{8}-?\d{1}$/.test(formData.cuit.replace(/\D/g, ""))) {
      const cuitDigits = formData.cuit.replace(/\D/g, "");
      if (cuitDigits.length !== 11) {
        newErrors.cuit = "El CUIT debe tener 11 dígitos";
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

    // Usar función de mapeo para alinear EXACTAMENTE con el DTO del backend
    const payload = mapCreateSupplierPayload(formData);

    try {
      await onSubmit(payload);
    } catch (error) {
      // El error ya se maneja en el componente padre
      if (process.env.NODE_ENV === "development") {
        console.error("Error en SupplierForm:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      {/* Nombre o Razón Social - OBLIGATORIO */}
      <FormField label="Nombre o Razón Social" required error={errors.nombre}>
        <Input
          type="text"
          value={formData.nombre || formData.name}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value, name: e.target.value })}
          placeholder="Ej: Proveedora S.A."
          required
        />
      </FormField>

      {/* CUIT y Email */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <FormField label="CUIT" error={errors.cuit}>
          <Input
            type="text"
            value={formData.cuit}
            onChange={(e) => {
              // Permitir solo números y guiones, formatear automáticamente
              const value = e.target.value.replace(/\D/g, "");
              let formatted = value;
              if (value.length > 2) {
                formatted = value.slice(0, 2) + "-" + value.slice(2);
              }
              if (value.length > 10) {
                formatted = value.slice(0, 2) + "-" + value.slice(2, 10) + "-" + value.slice(10);
              }
              setFormData({ ...formData, cuit: formatted });
            }}
            placeholder="20-12345678-9"
            maxLength={13}
          />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="proveedor@ejemplo.com"
          />
        </FormField>
      </div>

      {/* Teléfono y Contacto */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <FormField label="Teléfono">
          <Input
            type="tel"
            value={formData.telefono || formData.phone}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value, phone: e.target.value })}
            placeholder="+54 11 1234-5678"
          />
        </FormField>
        <FormField label="Contacto">
          <Input
            type="text"
            value={formData.contacto || formData.contactName}
            onChange={(e) => setFormData({ ...formData, contacto: e.target.value, contactName: e.target.value })}
            placeholder="Nombre del contacto"
          />
        </FormField>
      </div>

      {/* Dirección */}
      <FormField label="Dirección">
        <Textarea
          value={formData.direccion || formData.address}
          onChange={(e) => setFormData({ ...formData, direccion: e.target.value, address: e.target.value })}
          rows={3}
          placeholder="Dirección completa del proveedor"
        />
      </FormField>

      {/* Estado - Backend enum: ["provisional", "approved", "blocked", "rejected"] */}
      <FormField label="Estado" required>
        <Select
          value={formData.existstatus || "provisional"}
          onChange={(e) => {
            setFormData({ 
              ...formData, 
              existstatus: e.target.value
            });
          }}
        >
          <option value="provisional">Provisional</option>
          <option value="approved">Aprobado</option>
          <option value="blocked">Bloqueado</option>
          <option value="rejected">Rechazado</option>
        </Select>
      </FormField>

      {/* Notas */}
      <FormField label="Notas">
        <Textarea
          value={formData.notes || formData.notas}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value, notas: e.target.value })}
          rows={3}
          placeholder="Notas adicionales sobre el proveedor"
        />
      </FormField>

      {/* Botones */}
      <div style={{ display: "flex", gap: "var(--space-sm)", paddingTop: "var(--space-md)" }}>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          style={{ flex: 1 }}
        >
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear Proveedor"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
