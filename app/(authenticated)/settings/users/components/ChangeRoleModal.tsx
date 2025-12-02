"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useUsersStore, UserPMD } from "@/store/usersStore";
import { useRoles } from "@/hooks/api/roles";
import { useToast } from "@/components/ui/Toast";

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserPMD | null;
  onSuccess?: () => void;
}

export function ChangeRoleModal({ isOpen, onClose, user, onSuccess }: ChangeRoleModalProps) {
  const { changeUserRole } = useUsersStore();
  const { roles } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setSelectedRoleId(user.roleId || "");
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await changeUserRole(user.id, selectedRoleId);
      toast.success("Rol actualizado correctamente");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Error al cambiar rol:", err);
      toast.error(err.message || "Error al cambiar el rol");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cambiar Rol de Usuario" size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Selecciona un nuevo rol para <strong>{user.fullName}</strong>
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
          >
            <option value="">Sin rol asignado</option>
            {roles.map((role: any) => {
              const roleName = role.name || role.nombre || role.id;
              return (
                <option key={role.id} value={role.id}>
                  {roleName}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

