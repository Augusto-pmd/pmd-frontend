"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface EmployeeFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EmployeeForm({ initialData, onSubmit, onCancel, isLoading }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    nombre: "",
    name: "",
    dni: "",
    DNI: "",
    phone: "",
    telefono: "",
    email: "",
    area: "",
    areaTrabajo: "",
    position: "",
    puesto: "",
    role: "",
    subrole: "",
    hireDate: "",
    fechaIngreso: "",
    startDate: "",
    isActive: true,
    status: "active",
    estado: "activo",
    notes: "",
    notas: "",
    // Seguro
    seguro: {
      company: "",
      compania: "",
      policyNumber: "",
      numeroPoliza: "",
      expirationDate: "",
      fechaVencimiento: "",
    },
    insurance: {
      company: "",
      compania: "",
      policyNumber: "",
      numeroPoliza: "",
      expirationDate: "",
      fechaVencimiento: "",
    },
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      // Normalizar datos del backend
      const seguro = initialData.seguro || initialData.insurance || {};
      setFormData({
        fullName: initialData.fullName || initialData.nombre || initialData.name || "",
        nombre: initialData.nombre || initialData.fullName || initialData.name || "",
        name: initialData.name || initialData.fullName || initialData.nombre || "",
        dni: initialData.dni || initialData.DNI || "",
        DNI: initialData.DNI || initialData.dni || "",
        phone: initialData.phone || initialData.telefono || "",
        telefono: initialData.telefono || initialData.phone || "",
        email: initialData.email || "",
        area: initialData.area || initialData.areaTrabajo || "",
        areaTrabajo: initialData.areaTrabajo || initialData.area || "",
        position: initialData.position || initialData.puesto || "",
        puesto: initialData.puesto || initialData.position || "",
        role: initialData.role || "",
        subrole: initialData.subrole || "",
        hireDate: initialData.hireDate || initialData.fechaIngreso || initialData.startDate || "",
        fechaIngreso: initialData.fechaIngreso || initialData.hireDate || initialData.startDate || "",
        startDate: initialData.startDate || initialData.hireDate || initialData.fechaIngreso || "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : (initialData.status === "active" || initialData.estado === "activo"),
        status: initialData.status || initialData.estado || "active",
        estado: initialData.estado || initialData.status || "activo",
        notes: initialData.notes || initialData.notas || "",
        notas: initialData.notas || initialData.notes || "",
        seguro: {
          company: seguro.company || seguro.compania || "",
          compania: seguro.compania || seguro.company || "",
          policyNumber: seguro.policyNumber || seguro.numeroPoliza || "",
          numeroPoliza: seguro.numeroPoliza || seguro.policyNumber || "",
          expirationDate: seguro.expirationDate || seguro.fechaVencimiento || "",
          fechaVencimiento: seguro.fechaVencimiento || seguro.expirationDate || "",
        },
        insurance: {
          company: seguro.company || seguro.compania || "",
          compania: seguro.compania || seguro.company || "",
          policyNumber: seguro.policyNumber || seguro.numeroPoliza || "",
          numeroPoliza: seguro.numeroPoliza || seguro.policyNumber || "",
          expirationDate: seguro.expirationDate || seguro.fechaVencimiento || "",
          fechaVencimiento: seguro.fechaVencimiento || seguro.expirationDate || "",
        },
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const nombre = formData.fullName || formData.nombre || formData.name;
    if (!nombre?.trim()) {
      newErrors.fullName = "El nombre completo es obligatorio";
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

    // Preparar datos para enviar
    const payload: any = {
      fullName: formData.fullName || formData.nombre || formData.name,
      nombre: formData.nombre || formData.fullName || formData.name,
      dni: formData.dni || formData.DNI || undefined,
      phone: formData.phone || formData.telefono || undefined,
      telefono: formData.telefono || formData.phone || undefined,
      email: formData.email || undefined,
      area: formData.area || formData.areaTrabajo || undefined,
      areaTrabajo: formData.areaTrabajo || formData.area || undefined,
      position: formData.position || formData.puesto || undefined,
      puesto: formData.puesto || formData.position || undefined,
      role: formData.role || undefined,
      subrole: formData.subrole || undefined,
      hireDate: formData.hireDate || formData.fechaIngreso || formData.startDate || undefined,
      fechaIngreso: formData.fechaIngreso || formData.hireDate || formData.startDate || undefined,
      isActive: formData.isActive,
      status: formData.isActive ? "active" : "inactive",
      estado: formData.isActive ? "activo" : "inactivo",
      notes: formData.notes || formData.notas || undefined,
      notas: formData.notas || formData.notes || undefined,
    };

    // Agregar seguro si tiene datos
    if (formData.seguro.company || formData.seguro.compania || formData.seguro.policyNumber || formData.seguro.numeroPoliza || formData.seguro.expirationDate || formData.seguro.fechaVencimiento) {
      payload.seguro = {
        company: formData.seguro.company || formData.seguro.compania || undefined,
        compania: formData.seguro.compania || formData.seguro.company || undefined,
        policyNumber: formData.seguro.policyNumber || formData.seguro.numeroPoliza || undefined,
        numeroPoliza: formData.seguro.numeroPoliza || formData.seguro.policyNumber || undefined,
        expirationDate: formData.seguro.expirationDate || formData.seguro.fechaVencimiento || undefined,
        fechaVencimiento: formData.seguro.fechaVencimiento || formData.seguro.expirationDate || undefined,
      };
    }

    // Limpiar campos undefined
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === "") {
        delete payload[key];
      }
    });

    // Limpiar seguro si está vacío
    if (payload.seguro) {
      const seguroKeys = Object.keys(payload.seguro);
      if (seguroKeys.every((key) => !payload.seguro[key])) {
        delete payload.seguro;
      }
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre completo *"
          value={formData.fullName || formData.nombre || formData.name}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value, nombre: e.target.value, name: e.target.value })}
          error={errors.fullName}
          required
        />
        <Input
          label="DNI"
          value={formData.dni || formData.DNI}
          onChange={(e) => setFormData({ ...formData, dni: e.target.value, DNI: e.target.value })}
          placeholder="12345678"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          placeholder="empleado@ejemplo.com"
        />
        <Input
          label="Teléfono"
          value={formData.phone || formData.telefono}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value, telefono: e.target.value })}
          placeholder="+54 11 1234-5678"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Área *</label>
          <select
            value={formData.area || formData.areaTrabajo}
            onChange={(e) => setFormData({ ...formData, area: e.target.value, areaTrabajo: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
            required
          >
            <option value="">Seleccionar área</option>
            <option value="arquitectura">Arquitectura</option>
            <option value="obras">Obras</option>
            <option value="logistica">Logística</option>
            <option value="pañol">Pañol</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="administracion">Administración</option>
            <option value="direccion">Dirección</option>
            <option value="rrhh">RRHH</option>
          </select>
        </div>
        <Input
          label="Puesto / Posición"
          value={formData.position || formData.puesto}
          onChange={(e) => setFormData({ ...formData, position: e.target.value, puesto: e.target.value })}
          placeholder="Ej: Obrero, Arquitecto, Encargado"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Rol"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          placeholder="Ej: Jefe, Líder, Operario"
        />
        <Input
          label="Subrol"
          value={formData.subrole}
          onChange={(e) => setFormData({ ...formData, subrole: e.target.value })}
          placeholder="Ej: Especialista, Ayudante"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Fecha de ingreso"
          type="date"
          value={formData.hireDate || formData.fechaIngreso || formData.startDate}
          onChange={(e) => setFormData({ ...formData, hireDate: e.target.value, fechaIngreso: e.target.value, startDate: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            value={formData.isActive ? "active" : "inactive"}
            onChange={(e) => {
              const isActive = e.target.value === "active";
              setFormData({ ...formData, isActive, status: isActive ? "active" : "inactive", estado: isActive ? "activo" : "inactivo" });
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Sección de Seguro */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-pmd-darkBlue mb-4">Seguro de Accidentes Personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Compañía de seguros"
            value={formData.seguro.company || formData.seguro.compania}
            onChange={(e) => setFormData({
              ...formData,
              seguro: { ...formData.seguro, company: e.target.value, compania: e.target.value },
              insurance: { ...formData.insurance, company: e.target.value, compania: e.target.value },
            })}
            placeholder="Nombre de la compañía"
          />
          <Input
            label="Número de póliza"
            value={formData.seguro.policyNumber || formData.seguro.numeroPoliza}
            onChange={(e) => setFormData({
              ...formData,
              seguro: { ...formData.seguro, policyNumber: e.target.value, numeroPoliza: e.target.value },
              insurance: { ...formData.insurance, policyNumber: e.target.value, numeroPoliza: e.target.value },
            })}
            placeholder="Número de póliza"
          />
          <Input
            label="Fecha de vencimiento"
            type="date"
            value={formData.seguro.expirationDate || formData.seguro.fechaVencimiento}
            onChange={(e) => setFormData({
              ...formData,
              seguro: { ...formData.seguro, expirationDate: e.target.value, fechaVencimiento: e.target.value },
              insurance: { ...formData.insurance, expirationDate: e.target.value, fechaVencimiento: e.target.value },
            })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
        <textarea
          value={formData.notes || formData.notas}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value, notas: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          rows={3}
          placeholder="Notas adicionales sobre el empleado"
        />
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

