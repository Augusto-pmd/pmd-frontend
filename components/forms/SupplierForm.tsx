"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface SupplierFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
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
    estado: "pendiente",
    status: "pending",
    ...initialData,
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
        estado: initialData.estado || initialData.status || "pendiente",
        status: initialData.status || initialData.estado || "pending",
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const nombre = formData.nombre || formData.name;
    if (!nombre?.trim()) {
      newErrors.nombre = "El nombre o razón social es obligatorio";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Preparar datos para enviar (usar campos que el backend espera)
    const payload: any = {
      nombre: formData.nombre || formData.name,
      email: formData.email || undefined,
      cuit: formData.cuit || undefined,
      telefono: formData.telefono || formData.phone || undefined,
      direccion: formData.direccion || formData.address || undefined,
      contacto: formData.contacto || formData.contactName || undefined,
      estado: formData.estado || formData.status || "pendiente",
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
      <Input
        label="Nombre o Razón Social *"
        value={formData.nombre || formData.name}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value, name: e.target.value })}
        error={errors.nombre}
        required
      />
      <Input
        label="CUIT"
        value={formData.cuit}
        onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
        placeholder="20-12345678-9"
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        placeholder="proveedor@ejemplo.com"
      />
      <Input
        label="Teléfono"
        value={formData.telefono || formData.phone}
        onChange={(e) => setFormData({ ...formData, telefono: e.target.value, phone: e.target.value })}
        placeholder="+54 11 1234-5678"
      />
      <Input
        label="Contacto"
        value={formData.contacto || formData.contactName}
        onChange={(e) => setFormData({ ...formData, contacto: e.target.value, contactName: e.target.value })}
        placeholder="Nombre del contacto"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
        <textarea
          value={formData.direccion || formData.address}
          onChange={(e) => setFormData({ ...formData, direccion: e.target.value, address: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          rows={3}
          placeholder="Dirección completa del proveedor"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
        <select
          value={formData.estado || formData.status}
          onChange={(e) => setFormData({ ...formData, estado: e.target.value, status: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
        >
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
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
