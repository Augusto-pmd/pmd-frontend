"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useWorks } from "@/hooks/api/works";
import { employeeApi } from "@/hooks/api/employees";
import { useToast } from "@/components/ui/Toast";

interface Employee {
  id: string;
  fullName?: string;
  name?: string;
  nombre?: string;
  workId?: string;
  [key: string]: any;
}

interface AssignWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSuccess?: () => void;
}

export function AssignWorkModal({
  isOpen,
  onClose,
  employee,
  onSuccess,
}: AssignWorkModalProps) {
  const { works } = useWorks();
  const [selectedWorkId, setSelectedWorkId] = useState<string>(
    employee?.workId || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!employee) return;

    setIsSubmitting(true);
    try {
      await employeeApi.update(employee.id, { workId: selectedWorkId || null });
      toast.success("Obra asignada correctamente");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Error al asignar obra:", err);
      toast.error(err.message || "Error al asignar la obra");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!employee) return null;

  const name = employee.fullName || employee.name || employee.nombre || "Sin nombre";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Obra" size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Selecciona una obra para asignar a <strong>{name}</strong>
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Obra
          </label>
          <select
            value={selectedWorkId}
            onChange={(e) => setSelectedWorkId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
          >
            <option value="">Sin obra asignada</option>
            {works.map((work: any) => {
              const workName = work.name || work.title || work.nombre || work.id;
              return (
                <option key={work.id} value={work.id}>
                  {workName}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Asignando..." : "Asignar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

