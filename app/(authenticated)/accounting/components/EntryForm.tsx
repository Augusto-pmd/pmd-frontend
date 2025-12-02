"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useWorks } from "@/hooks/api/works";
import { useSuppliers } from "@/hooks/api/suppliers";

interface EntryFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EntryForm({ initialData, onSubmit, onCancel, isLoading }: EntryFormProps) {
  const { works } = useWorks();
  const { suppliers } = useSuppliers();
  const [formData, setFormData] = useState({
    date: "",
    fecha: "",
    workId: "",
    obraId: "",
    supplierId: "",
    proveedorId: "",
    type: "egreso" as "ingreso" | "egreso" | "income" | "expense",
    tipo: "egreso" as "ingreso" | "egreso",
    amount: 0,
    monto: 0,
    category: "",
    categoria: "",
    notes: "",
    notas: "",
    description: "",
    descripcion: "",
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      // Normalizar datos del backend
      const fecha = initialData.date || initialData.fecha || "";
      setFormData({
        date: fecha.split("T")[0] || "",
        fecha: fecha.split("T")[0] || "",
        workId: initialData.workId || initialData.obraId || "",
        obraId: initialData.obraId || initialData.workId || "",
        supplierId: initialData.supplierId || initialData.proveedorId || "",
        proveedorId: initialData.proveedorId || initialData.supplierId || "",
        type: initialData.type || initialData.tipo || "egreso",
        tipo: initialData.tipo || initialData.type || "egreso",
        amount: initialData.amount || initialData.monto || 0,
        monto: initialData.monto || initialData.amount || 0,
        category: initialData.category || initialData.categoria || "",
        categoria: initialData.categoria || initialData.category || "",
        notes: initialData.notes || initialData.notas || initialData.description || initialData.descripcion || "",
        notas: initialData.notas || initialData.notes || initialData.descripcion || initialData.description || "",
        description: initialData.description || initialData.descripcion || initialData.notes || initialData.notas || "",
        descripcion: initialData.descripcion || initialData.description || initialData.notas || initialData.notes || "",
      });
    } else {
      // Establecer fecha por defecto a hoy
      const today = new Date().toISOString().split("T")[0];
      setFormData((prev: any) => ({ ...prev, date: today, fecha: today }));
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date && !formData.fecha) {
      newErrors.date = "La fecha es obligatoria";
    }
    if (!formData.amount && !formData.monto) {
      newErrors.amount = "El monto es obligatorio";
    } else if ((formData.amount || formData.monto || 0) <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Preparar datos para enviar
    const payload: any = {
      date: formData.date || formData.fecha,
      fecha: formData.fecha || formData.date,
      workId: formData.workId || formData.obraId || undefined,
      obraId: formData.obraId || formData.workId || undefined,
      supplierId: formData.supplierId || formData.proveedorId || undefined,
      proveedorId: formData.proveedorId || formData.supplierId || undefined,
      type: formData.type || formData.tipo,
      tipo: formData.tipo || formData.type,
      amount: formData.amount || formData.monto,
      monto: formData.monto || formData.amount,
      category: formData.category || formData.categoria || undefined,
      categoria: formData.categoria || formData.category || undefined,
      notes: formData.notes || formData.notas || formData.description || formData.descripcion || undefined,
      notas: formData.notas || formData.notes || formData.descripcion || formData.description || undefined,
      description: formData.description || formData.descripcion || formData.notes || formData.notas || undefined,
      descripcion: formData.descripcion || formData.description || formData.notas || formData.notes || undefined,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Fecha *"
          type="date"
          value={formData.date || formData.fecha}
          onChange={(e) => setFormData({ ...formData, date: e.target.value, fecha: e.target.value })}
          error={errors.date}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
          <select
            value={formData.type || formData.tipo}
            onChange={(e) => {
              const tipo = e.target.value as "ingreso" | "egreso" | "income" | "expense";
              let type = tipo;
              if (tipo === "ingreso") type = "income";
              else if (tipo === "egreso") type = "expense";
              setFormData({ ...formData, type, tipo: tipo === "income" ? "ingreso" : "egreso" });
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
            required
          >
            <option value="egreso">Egreso</option>
            <option value="ingreso">Ingreso</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Obra</label>
          <select
            value={formData.workId || formData.obraId}
            onChange={(e) => setFormData({ ...formData, workId: e.target.value, obraId: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          >
            <option value="">Seleccionar obra</option>
            {works?.map((work: any) => {
              const nombre = work.nombre || work.name || work.title || "Sin nombre";
              return (
                <option key={work.id} value={work.id}>
                  {nombre}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
          <select
            value={formData.supplierId || formData.proveedorId}
            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value, proveedorId: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          >
            <option value="">Seleccionar proveedor</option>
            {suppliers?.map((sup: any) => {
              const nombre = sup.nombre || sup.name || "Sin nombre";
              return (
                <option key={sup.id} value={sup.id}>
                  {nombre}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Monto *"
          type="number"
          step="0.01"
          value={formData.amount || formData.monto}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            setFormData({ ...formData, amount: value, monto: value });
          }}
          error={errors.amount}
          required
          placeholder="0.00"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <select
            value={formData.category || formData.categoria}
            onChange={(e) => setFormData({ ...formData, category: e.target.value, categoria: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          >
            <option value="">Seleccionar categoría</option>
            <option value="materiales">Materiales</option>
            <option value="mano-de-obra">Mano de obra</option>
            <option value="honorarios">Honorarios</option>
            <option value="impuestos">Impuestos</option>
            <option value="servicios">Servicios</option>
            <option value="alquileres">Alquileres</option>
            <option value="combustible">Combustible</option>
            <option value="otros">Otros</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notas / Descripción</label>
        <textarea
          value={formData.notes || formData.notas || formData.description || formData.descripcion}
          onChange={(e) => setFormData({
            ...formData,
            notes: e.target.value,
            notas: e.target.value,
            description: e.target.value,
            descripcion: e.target.value,
          })}
          className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
          rows={3}
          placeholder="Notas adicionales sobre el movimiento"
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

