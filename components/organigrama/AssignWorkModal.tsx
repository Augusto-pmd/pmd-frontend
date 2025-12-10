"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/FormField";
import { useWorks } from "@/hooks/api/works";
// NOTE: employeeApi removed - backend does not have /api/employees endpoint
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
      // NOTE: This functionality is not available - backend does not have /api/employees endpoint
      toast.error("Esta funcionalidad no está disponible. El módulo de RRHH no existe en el backend.");
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

  const workOptions = [
    { value: "", label: "Sin obra asignada" },
    ...works.map((work: any) => {
      const workName = work.name || work.title || work.nombre || work.id;
      return { value: work.id, label: workName };
    }),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignar Obra"
      subtitle={`Selecciona una obra para asignar a ${name}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Asignando..." : "Asignar"}
          </Button>
        </>
      }
    >
      <SelectField
        label="Obra"
        value={selectedWorkId}
        onChange={(e) => setSelectedWorkId(e.target.value)}
        options={workOptions}
      />
    </Modal>
  );
}

