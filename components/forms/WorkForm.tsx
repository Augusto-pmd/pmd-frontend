"use client";

import { useState, useEffect } from "react";
import { normalizeId } from "@/lib/normalizeId";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useUsers } from "@/hooks/api/users";

interface WorkFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WorkForm({ initialData, onSubmit, onCancel, isLoading }: WorkFormProps) {
  const { users } = useUsers();
  
  const [formData, setFormData] = useState({
    nombre: "",
    name: "",
    direccion: "",
    address: "",
    clienteId: "",
    clientId: "",
    fechaInicio: "",
    startDate: "",
    fechaFin: "",
    endDate: "",
    estado: "planificada",
    status: "planned",
    descripcion: "",
    description: "",
    metrosCuadrados: "",
    squareMeters: "",
    responsableId: "",
    managerId: "",
    presupuesto: "",
    budget: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      // Normalizar datos del backend
      setFormData({
        nombre: initialData.nombre || initialData.name || "",
        name: initialData.name || initialData.nombre || "",
        direccion: initialData.direccion || initialData.address || "",
        address: initialData.address || initialData.direccion || "",
        clienteId: initialData.clienteId || initialData.clientId || "",
        clientId: initialData.clientId || initialData.clienteId || "",
        fechaInicio: initialData.fechaInicio || initialData.startDate || initialData.estimatedStartDate || "",
        startDate: initialData.startDate || initialData.fechaInicio || initialData.estimatedStartDate || "",
        fechaFin: initialData.fechaFin || initialData.endDate || "",
        endDate: initialData.endDate || initialData.fechaFin || "",
        estado: initialData.estado || initialData.status || "planificada",
        status: initialData.status || initialData.estado || "planned",
        descripcion: initialData.descripcion || initialData.description || "",
        description: initialData.description || initialData.descripcion || "",
        metrosCuadrados: initialData.metrosCuadrados || initialData.squareMeters || "",
        squareMeters: initialData.squareMeters || initialData.metrosCuadrados || "",
        responsableId: initialData.responsableId || initialData.managerId || "",
        managerId: initialData.managerId || initialData.responsableId || "",
        presupuesto: initialData.presupuesto || initialData.budget || "",
        budget: initialData.budget || initialData.presupuesto || "",
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validación obligatoria: nombre
    const nombre = formData.nombre || formData.name;
    if (!nombre?.trim()) {
      newErrors.nombre = "El nombre de la obra es obligatorio";
    }
    
    // Validar fechas si están presentes
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      if (inicio > fin) {
        newErrors.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio";
      }
    }
    
    // Validar metros cuadrados si está presente
    if (formData.metrosCuadrados && parseFloat(formData.metrosCuadrados) < 0) {
      newErrors.metrosCuadrados = "Los metros cuadrados deben ser un valor positivo";
    }
    
    // Validar presupuesto si está presente
    if (formData.presupuesto && parseFloat(formData.presupuesto) < 0) {
      newErrors.presupuesto = "El presupuesto debe ser un valor positivo";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Preparar payload EXACTO según CreateWorkDto del backend
    // Solo enviar campos que existen en el backend DTO
    const payload: any = {
      nombre: (formData.nombre || formData.name).trim(),
    };

    // Campos opcionales - solo agregar si tienen valor
    if (formData.direccion || formData.address) {
      payload.direccion = (formData.direccion || formData.address).trim();
    }
    if (formData.fechaInicio || formData.startDate) {
      payload.fechaInicio = formData.fechaInicio || formData.startDate;
    }
    if (formData.fechaFin || formData.endDate) {
      payload.fechaFin = formData.fechaFin || formData.endDate;
    }
    if (formData.estado || formData.status) {
      payload.estado = formData.estado || formData.status;
    }
    if (formData.descripcion || formData.description) {
      payload.descripcion = (formData.descripcion || formData.description).trim();
    }
    if (formData.metrosCuadrados) {
      const metros = parseFloat(formData.metrosCuadrados);
      if (!isNaN(metros) && metros > 0) {
        payload.metrosCuadrados = metros;
      }
    }
    if (formData.responsableId || formData.managerId) {
      payload.responsableId = formData.responsableId || formData.managerId;
    }
    if (formData.presupuesto) {
      const presupuesto = parseFloat(formData.presupuesto);
      if (!isNaN(presupuesto) && presupuesto > 0) {
        payload.presupuesto = presupuesto;
      }
    }

    // Asegurar que el payload no esté vacío
    if (Object.keys(payload).length === 0) {
      throw new Error("El payload no puede estar vacío. Al menos el nombre es requerido.");
    }

    try {
      await onSubmit(payload);
    } catch (error) {
      // El error ya se maneja en el componente padre
      console.error("Error en WorkForm:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      {/* Nombre de la obra - OBLIGATORIO */}
      <FormField label="Nombre de la obra" required error={errors.nombre}>
        <Input
          type="text"
          value={formData.nombre || formData.name}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value, name: e.target.value })}
          placeholder="Ej: Edificio Residencial Centro"
          required
        />
      </FormField>

      {/* Dirección */}
      <FormField label="Dirección">
        <Input
          type="text"
          value={formData.direccion || formData.address}
          onChange={(e) => setFormData({ ...formData, direccion: e.target.value, address: e.target.value })}
          placeholder="Dirección completa de la obra"
        />
      </FormField>

      {/* Metros cuadrados */}
      <FormField label="Metros cuadrados" error={errors.metrosCuadrados}>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={formData.metrosCuadrados || formData.squareMeters}
          onChange={(e) => setFormData({ ...formData, metrosCuadrados: e.target.value, squareMeters: e.target.value })}
          placeholder="m²"
        />
      </FormField>

      {/* Estado - OBLIGATORIO */}
      <FormField label="Estado" required>
        <Select
          value={formData.estado || formData.status}
          onChange={(e) => {
            const estado = e.target.value;
            let status = "planned";
            if (estado === "planificada") status = "planned";
            else if (estado === "en-ejecucion" || estado === "activa") status = "active";
            else if (estado === "pausada") status = "paused";
            else if (estado === "finalizada" || estado === "completada") status = "completed";
            setFormData({ ...formData, estado: estado, status: status });
          }}
          required
        >
          <option value="planificada">Planificada</option>
          <option value="en-ejecucion">En ejecución</option>
          <option value="activa">Activa</option>
          <option value="pausada">Pausada</option>
          <option value="finalizada">Finalizada</option>
          <option value="completada">Completada</option>
        </Select>
      </FormField>

      {/* Fechas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <FormField label="Fecha de inicio">
          <Input
            type="date"
            value={formData.fechaInicio || formData.startDate}
            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value, startDate: e.target.value })}
          />
        </FormField>
        <FormField label="Fecha estimada de finalización" error={errors.fechaFin}>
          <Input
            type="date"
            value={formData.fechaFin || formData.endDate}
            onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value, endDate: e.target.value })}
            min={formData.fechaInicio || formData.startDate}
          />
        </FormField>
      </div>

      {/* Responsable y Presupuesto */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <FormField label="Responsable">
          <Select
            value={formData.responsableId || formData.managerId}
            onChange={(e) => setFormData({ ...formData, responsableId: e.target.value, managerId: e.target.value })}
          >
            <option value="">Seleccionar responsable</option>
            {users?.map((user: any) => {
              const nombre = user.fullName || user.name || user.nombre || "Sin nombre";
              return (
                <option key={user.id} value={normalizeId(user.id)}>
                  {nombre}
                </option>
              );
            })}
          </Select>
        </FormField>
        <FormField label="Presupuesto" error={errors.presupuesto}>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.presupuesto || formData.budget}
            onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value, budget: e.target.value })}
            placeholder="0.00"
          />
        </FormField>
      </div>

      {/* Descripción */}
      <FormField label="Descripción">
        <Textarea
          value={formData.descripcion || formData.description}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value, description: e.target.value })}
          rows={4}
          placeholder="Descripción detallada de la obra"
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
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear Obra"}
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
