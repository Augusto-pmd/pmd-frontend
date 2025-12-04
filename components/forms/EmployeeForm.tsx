"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useWorks } from "@/hooks/api/works";

interface EmployeeFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EmployeeForm({ initialData, onSubmit, onCancel, isLoading }: EmployeeFormProps) {
  const { works } = useWorks();
  
  const [formData, setFormData] = useState({
    fullName: "",
    dni: "",
    email: "",
    phone: "",
    area: "",
    position: "",
    role: "",
    subrole: "",
    hireDate: "",
    workId: "",
    address: "",
    notes: "",
    isActive: true,
    status: "active",
    // Nuevos campos
    salary: "",
    department: "",
    salaryHistory: [] as Array<{
      date: string;
      previousSalary: number;
      newSalary: number;
      reason?: string;
    }>,
    // Seguro
    seguro: {
      company: "",
      policyNumber: "",
      expirationDate: "",
    },
  });

  const [showSalaryHistoryForm, setShowSalaryHistoryForm] = useState(false);
  const [newSalaryEntry, setNewSalaryEntry] = useState({
    newSalary: "",
    reason: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      // Normalizar datos del backend (puede venir en español o inglés)
      const seguro = initialData.seguro || initialData.insurance || {};
      
      setFormData({
        fullName: initialData.fullName || initialData.nombre || initialData.name || "",
        dni: initialData.dni || initialData.DNI || "",
        email: initialData.email || "",
        phone: initialData.phone || initialData.telefono || initialData.telephone || "",
        area: initialData.area || initialData.areaTrabajo || "",
        position: initialData.position || initialData.puesto || "",
        role: initialData.role || "",
        subrole: initialData.subrole || "",
        hireDate: initialData.hireDate || initialData.fechaIngreso || initialData.startDate || "",
        workId: initialData.workId || "",
        address: initialData.address || initialData.direccion || "",
        notes: initialData.notes || initialData.notas || "",
        isActive: initialData.isActive !== undefined ? initialData.isActive : (initialData.status === "active" || initialData.estado === "activo"),
        status: initialData.status || initialData.estado || "active",
        // Nuevos campos
        salary: initialData.salary ? String(initialData.salary) : "",
        department: initialData.department || initialData.departamento || "",
        salaryHistory: initialData.salaryHistory || initialData.historialSalario || [],
        seguro: {
          company: seguro.company || seguro.compania || "",
          policyNumber: seguro.policyNumber || seguro.numeroPoliza || "",
          expirationDate: seguro.expirationDate || seguro.fechaVencimiento || "",
        },
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones obligatorias
    if (!formData.fullName?.trim()) {
      newErrors.fullName = "El nombre completo es obligatorio";
    }
    
    // Validar sueldo si está presente
    if (formData.salary && (isNaN(Number(formData.salary)) || Number(formData.salary) < 0)) {
      newErrors.salary = "El sueldo debe ser un número válido mayor o igual a 0";
    }
    
    // Validar email si está presente
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    
    // Validar DNI si está presente (formato básico)
    if (formData.dni && !/^\d{7,8}$/.test(formData.dni.replace(/\D/g, ""))) {
      newErrors.dni = "El DNI debe tener 7 u 8 dígitos";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSalaryIncrease = () => {
    if (!newSalaryEntry.newSalary || isNaN(Number(newSalaryEntry.newSalary)) || Number(newSalaryEntry.newSalary) <= 0) {
      setErrors({ ...errors, salaryHistory: "El nuevo sueldo debe ser un número válido mayor a 0" });
      return;
    }

    const currentSalary = formData.salary ? Number(formData.salary) : 0;
    const newSalary = Number(newSalaryEntry.newSalary);
    const today = new Date().toISOString().split("T")[0];

    const newHistoryEntry = {
      date: today,
      previousSalary: currentSalary,
      newSalary: newSalary,
      reason: newSalaryEntry.reason.trim() || undefined,
    };

    setFormData({
      ...formData,
      salary: String(newSalary),
      salaryHistory: [...formData.salaryHistory, newHistoryEntry],
    });

    setNewSalaryEntry({ newSalary: "", reason: "" });
    setShowSalaryHistoryForm(false);
    const newErrors = { ...errors };
    delete newErrors.salaryHistory;
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Preparar payload según lo que el backend espera
    // El backend puede aceptar tanto nombres en español como en inglés
    const payload: any = {
      // Campos principales (usar fullName como estándar, pero también enviar nombre para compatibilidad)
      fullName: formData.fullName.trim(),
      nombre: formData.fullName.trim(), // Compatibilidad con backend en español
      dni: formData.dni.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      telefono: formData.phone.trim() || undefined, // Compatibilidad
      area: formData.area || undefined,
      areaTrabajo: formData.area || undefined, // Compatibilidad
      position: formData.position.trim() || undefined,
      puesto: formData.position.trim() || undefined, // Compatibilidad
      role: formData.role.trim() || undefined,
      subrole: formData.subrole.trim() || undefined,
      hireDate: formData.hireDate || undefined,
      fechaIngreso: formData.hireDate || undefined, // Compatibilidad
      workId: formData.workId || undefined,
      address: formData.address.trim() || undefined,
      direccion: formData.address.trim() || undefined, // Compatibilidad
      notes: formData.notes.trim() || undefined,
      notas: formData.notes.trim() || undefined, // Compatibilidad
      isActive: formData.isActive,
      status: formData.isActive ? "active" : "inactive",
      estado: formData.isActive ? "activo" : "inactivo", // Compatibilidad
      // Nuevos campos
      salary: formData.salary ? Number(formData.salary) : undefined,
      department: formData.department.trim() || undefined,
      departamento: formData.department.trim() || undefined, // Compatibilidad
      salaryHistory: formData.salaryHistory.length > 0 ? formData.salaryHistory : undefined,
      historialSalario: formData.salaryHistory.length > 0 ? formData.salaryHistory : undefined, // Compatibilidad
    };

    // Agregar seguro si tiene datos
    if (formData.seguro.company || formData.seguro.policyNumber || formData.seguro.expirationDate) {
      payload.seguro = {
        company: formData.seguro.company.trim() || undefined,
        compania: formData.seguro.company.trim() || undefined, // Compatibilidad
        policyNumber: formData.seguro.policyNumber.trim() || undefined,
        numeroPoliza: formData.seguro.policyNumber.trim() || undefined, // Compatibilidad
        expirationDate: formData.seguro.expirationDate || undefined,
        fechaVencimiento: formData.seguro.expirationDate || undefined, // Compatibilidad
      };
      
      // Limpiar campos undefined del seguro
      Object.keys(payload.seguro).forEach((key) => {
        if (payload.seguro[key] === undefined) {
          delete payload.seguro[key];
        }
      });
      
      // Si el seguro está vacío, no enviarlo
      if (Object.keys(payload.seguro).length === 0) {
        delete payload.seguro;
      }
    }

    // Limpiar campos undefined del payload principal
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === "") {
        delete payload[key];
      }
    });

    try {
      await onSubmit(payload);
    } catch (error) {
      // El error ya se maneja en el componente padre
      console.error("Error en EmployeeForm:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      {/* Nombre completo - OBLIGATORIO */}
      <FormField label="Nombre completo" required error={errors.fullName}>
        <Input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Ej: Juan Pérez"
          required
        />
      </FormField>

      {/* DNI y Email */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <FormField label="DNI" error={errors.dni}>
          <Input
            type="text"
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, "") })}
            placeholder="12345678"
            maxLength={8}
          />
        </FormField>
        <FormField label="Email" error={errors.email}>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="empleado@ejemplo.com"
          />
        </FormField>
      </div>

      {/* Teléfono y Departamento */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <FormField label="Teléfono">
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+54 11 1234-5678"
          />
        </FormField>
        <FormField label="Departamento" required>
          <Select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
          >
            <option value="">Seleccionar departamento</option>
            <option value="Arquitectura">Arquitectura</option>
            <option value="Administración">Administración</option>
            <option value="Logística">Logística</option>
            <option value="Oficina Técnica">Oficina Técnica</option>
            <option value="Jefe de Obra">Jefe de Obra</option>
            <option value="Operativo">Operativo</option>
          </Select>
        </FormField>
      </div>

      {/* Puesto y Rol */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <FormField label="Puesto / Posición">
          <Input
            type="text"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="Ej: Obrero, Arquitecto, Encargado"
          />
        </FormField>
        <FormField label="Rol">
          <Input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Ej: Jefe, Líder, Operario"
          />
        </FormField>
      </div>

      {/* Subrol y Fecha de ingreso */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <FormField label="Subrol">
          <Input
            type="text"
            value={formData.subrole}
            onChange={(e) => setFormData({ ...formData, subrole: e.target.value })}
            placeholder="Ej: Especialista, Ayudante"
          />
        </FormField>
        <FormField label="Fecha de ingreso">
          <Input
            type="date"
            value={formData.hireDate}
            onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
          />
        </FormField>
      </div>

      {/* Sueldo mensual */}
      <FormField label="Sueldo mensual" required error={errors.salary}>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={formData.salary}
          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
          placeholder="Ej: 150000"
          required
        />
      </FormField>

      {/* Historial de aumentos */}
      {initialData && (
        <div style={{ paddingTop: "var(--space-md)", borderTop: "1px solid var(--apple-border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
            <h3 style={{ font: "var(--font-card-title)", color: "var(--apple-text-primary)" }}>
              Historial de Aumentos
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSalaryHistoryForm(!showSalaryHistoryForm)}
            >
              {showSalaryHistoryForm ? "Cancelar" : "Agregar Aumento"}
            </Button>
          </div>

          {showSalaryHistoryForm && (
            <div style={{ padding: "var(--space-md)", backgroundColor: "var(--apple-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--apple-border)", marginBottom: "var(--space-md)" }}>
              <FormField label="Nuevo sueldo" required error={errors.salaryHistory}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newSalaryEntry.newSalary}
                  onChange={(e) => setNewSalaryEntry({ ...newSalaryEntry, newSalary: e.target.value })}
                  placeholder="Ej: 180000"
                  required
                />
              </FormField>
              <FormField label="Motivo del aumento (opcional)">
                <Input
                  type="text"
                  value={newSalaryEntry.reason}
                  onChange={(e) => setNewSalaryEntry({ ...newSalaryEntry, reason: e.target.value })}
                  placeholder="Ej: Aumento por desempeño, Ajuste por inflación"
                />
              </FormField>
              <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-sm)" }}>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleAddSalaryIncrease}
                  style={{ flex: 1 }}
                >
                  Agregar Aumento
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSalaryHistoryForm(false);
                    setNewSalaryEntry({ newSalary: "", reason: "" });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {formData.salaryHistory.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {formData.salaryHistory.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    padding: "var(--space-sm)",
                    backgroundColor: "var(--apple-surface)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--apple-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--apple-text-primary)" }}>
                      ${entry.newSalary.toLocaleString("es-AR")} - {new Date(entry.date).toLocaleDateString("es-AR")}
                    </p>
                    {entry.reason && (
                      <p style={{ fontSize: "12px", color: "var(--apple-text-secondary)", marginTop: "4px" }}>
                        {entry.reason}
                      </p>
                    )}
                    <p style={{ fontSize: "12px", color: "var(--apple-text-secondary)" }}>
                      Anterior: ${entry.previousSalary.toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Obra asignada (opcional) */}
      <FormField label="Obra asignada (opcional)">
        <Select
          value={formData.workId}
          onChange={(e) => setFormData({ ...formData, workId: e.target.value })}
        >
          <option value="">Sin obra asignada</option>
          {works?.map((work: any) => (
            <option key={work.id} value={work.id}>
              {work.name || work.nombre || work.title || `Obra ${work.id.slice(0, 8)}`}
            </option>
          ))}
        </Select>
      </FormField>

      {/* Dirección */}
      <FormField label="Dirección">
        <Input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Dirección completa"
        />
      </FormField>

      {/* Estado (solo si es edición) */}
      {initialData && (
        <FormField label="Estado">
          <Select
            value={formData.isActive ? "active" : "inactive"}
            onChange={(e) => {
              const isActive = e.target.value === "active";
              setFormData({ ...formData, isActive, status: isActive ? "active" : "inactive" });
            }}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </Select>
        </FormField>
      )}

      {/* Sección de Seguro */}
      <div style={{ paddingTop: "var(--space-md)", borderTop: "1px solid var(--apple-border)" }}>
        <h3 style={{ font: "var(--font-card-title)", color: "var(--apple-text-primary)", marginBottom: "var(--space-md)" }}>
          Seguro de Accidentes Personales (Opcional)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <FormField label="Compañía de seguros">
            <Input
              type="text"
              value={formData.seguro.company}
              onChange={(e) => setFormData({
                ...formData,
                seguro: { ...formData.seguro, company: e.target.value },
              })}
              placeholder="Nombre de la compañía"
            />
          </FormField>
          <FormField label="Número de póliza">
            <Input
              type="text"
              value={formData.seguro.policyNumber}
              onChange={(e) => setFormData({
                ...formData,
                seguro: { ...formData.seguro, policyNumber: e.target.value },
              })}
              placeholder="Número de póliza"
            />
          </FormField>
        </div>
        <FormField label="Fecha de vencimiento">
          <Input
            type="date"
            value={formData.seguro.expirationDate}
            onChange={(e) => setFormData({
              ...formData,
              seguro: { ...formData.seguro, expirationDate: e.target.value },
            })}
          />
        </FormField>
      </div>

      {/* Notas */}
      <FormField label="Notas">
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Notas adicionales sobre el empleado"
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
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear Empleado"}
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
