"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useEmployees } from "@/hooks/api/employees";

interface WorkFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WorkForm({ initialData, onSubmit, onCancel, isLoading }: WorkFormProps) {
  const { employees } = useEmployees();
  const [formData, setFormData] = useState({
    nombre: "",
    name: "",
    direccion: "",
    address: "",
    clienteId: "",
    clientId: "",
    cliente: "",
    client: "",
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
    presupuesto: 0,
    budget: 0,
    ...initialData,
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
        cliente: initialData.cliente || initialData.client || "",
        client: initialData.client || initialData.cliente || "",
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
        presupuesto: initialData.presupuesto || initialData.budget || 0,
        budget: initialData.budget || initialData.presupuesto || 0,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const nombre = formData.nombre || formData.name;
    if (!nombre?.trim()) {
      newErrors.nombre = "El nombre de la obra es obligatorio";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Preparar datos para enviar
    const payload: any = {
      nombre: formData.nombre || formData.name,
      name: formData.name || formData.nombre,
      direccion: formData.direccion || formData.address || undefined,
      address: formData.address || formData.direccion || undefined,
      clienteId: formData.clienteId || formData.clientId || undefined,
      clientId: formData.clientId || formData.clienteId || undefined,
      cliente: formData.cliente || formData.client || undefined,
      client: formData.client || formData.cliente || undefined,
      fechaInicio: formData.fechaInicio || formData.startDate || undefined,
      startDate: formData.startDate || formData.fechaInicio || undefined,
      fechaFin: formData.fechaFin || formData.endDate || undefined,
      endDate: formData.endDate || formData.fechaFin || undefined,
      estado: formData.estado || formData.status || "planificada",
      status: formData.status || formData.estado || "planned",
      descripcion: formData.descripcion || formData.description || undefined,
      description: formData.description || formData.descripcion || undefined,
      metrosCuadrados: formData.metrosCuadrados || formData.squareMeters || undefined,
      squareMeters: formData.squareMeters || formData.metrosCuadrados || undefined,
      responsableId: formData.responsableId || formData.managerId || undefined,
      managerId: formData.managerId || formData.responsableId || undefined,
      presupuesto: formData.presupuesto || formData.budget || undefined,
      budget: formData.budget || formData.presupuesto || undefined,
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
        label="Nombre de la obra *"
        value={formData.nombre || formData.name}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value, name: e.target.value })}
        error={errors.nombre}
        required
      />

      <Input
        label="Dirección"
        value={formData.direccion || formData.address}
        onChange={(e) => setFormData({ ...formData, direccion: e.target.value, address: e.target.value })}
        placeholder="Dirección completa de la obra"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Cliente"
          value={formData.cliente || formData.client}
          onChange={(e) => setFormData({ ...formData, cliente: e.target.value, client: e.target.value })}
          placeholder="Nombre del cliente"
        />
        <Input
          label="Metros cuadrados"
          type="number"
          step="0.01"
          value={formData.metrosCuadrados || formData.squareMeters}
          onChange={(e) => setFormData({ ...formData, metrosCuadrados: e.target.value, squareMeters: e.target.value })}
          placeholder="m²"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
        <select
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
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          required
        >
          <option value="planificada">Planificada</option>
          <option value="en-ejecucion">En ejecución</option>
          <option value="activa">Activa</option>
          <option value="pausada">Pausada</option>
          <option value="finalizada">Finalizada</option>
          <option value="completada">Completada</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Fecha de inicio"
          type="date"
          value={formData.fechaInicio || formData.startDate}
          onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value, startDate: e.target.value })}
        />
        <Input
          label="Fecha estimada de finalización"
          type="date"
          value={formData.fechaFin || formData.endDate}
          onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value, endDate: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
        <select
          value={formData.responsableId || formData.managerId}
          onChange={(e) => setFormData({ ...formData, responsableId: e.target.value, managerId: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
        >
          <option value="">Seleccionar responsable</option>
          {employees?.map((emp: any) => {
            const nombre = emp.nombre || emp.fullName || emp.name || "Sin nombre";
            return (
              <option key={emp.id} value={emp.id}>
                {nombre}
              </option>
            );
          })}
        </select>
      </div>

      <Input
        label="Presupuesto"
        type="number"
        step="0.01"
        value={formData.presupuesto || formData.budget}
        onChange={(e) => setFormData({ ...formData, presupuesto: parseFloat(e.target.value) || 0, budget: parseFloat(e.target.value) || 0 })}
        placeholder="0.00"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
        <textarea
          value={formData.descripcion || formData.description}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          rows={4}
          placeholder="Descripción detallada de la obra"
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

