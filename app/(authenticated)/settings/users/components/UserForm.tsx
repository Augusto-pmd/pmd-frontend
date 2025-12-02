"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUsersStore, UserPMD } from "@/store/usersStore";
import { useRoles } from "@/hooks/api/roles";
import { useToast } from "@/components/ui/Toast";

interface UserFormProps {
  user?: UserPMD | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { createUser, updateUser } = useUsersStore();
  const { roles } = useRoles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    roleId: "",
    isActive: true,
    password: "",
    confirmPassword: "",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        roleId: user.roleId || "",
        isActive: user.isActive !== false,
        password: "",
        confirmPassword: "",
        notes: user.notes || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones
      if (!formData.fullName.trim()) {
        toast.error("El nombre completo es obligatorio");
        setIsSubmitting(false);
        return;
      }

      if (!formData.email.trim()) {
        toast.error("El email es obligatorio");
        setIsSubmitting(false);
        return;
      }

      // Validar email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("El email no es válido");
        setIsSubmitting(false);
        return;
      }

      // Si es creación, validar contraseña
      if (!user) {
        if (!formData.password) {
          toast.error("La contraseña es obligatoria");
          setIsSubmitting(false);
          return;
        }

        if (formData.password.length < 6) {
          toast.error("La contraseña debe tener al menos 6 caracteres");
          setIsSubmitting(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Las contraseñas no coinciden");
          setIsSubmitting(false);
          return;
        }
      }

      // Si es edición y hay contraseña, validar
      if (user && formData.password) {
        if (formData.password.length < 6) {
          toast.error("La contraseña debe tener al menos 6 caracteres");
          setIsSubmitting(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Las contraseñas no coinciden");
          setIsSubmitting(false);
          return;
        }
      }

      const payload: any = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        roleId: formData.roleId || undefined,
        isActive: formData.isActive,
        notes: formData.notes.trim() || undefined,
      };

      // Solo incluir contraseña si se proporcionó
      if (formData.password) {
        payload.password = formData.password;
      }

      if (user) {
        await updateUser(user.id, payload);
        toast.success("Usuario actualizado correctamente");
      } else {
        await createUser(payload);
        toast.success("Usuario creado correctamente");
      }

      onSuccess?.();
    } catch (err: any) {
      console.error("Error al guardar usuario:", err);
      toast.error(err.message || "Error al guardar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre Completo <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, fullName: e.target.value }))}
          required
          placeholder="Nombre completo del usuario"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
          required
          placeholder="usuario@pmd.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
        <select
          value={formData.roleId}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, roleId: e.target.value }))}
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

      {!user && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, password: e.target.value }))}
              required={!user}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repetir Contraseña <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, confirmPassword: e.target.value }))}
              required={!user}
              placeholder="Repetir contraseña"
            />
          </div>
        </>
      )}

      {user && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña (opcional)
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, password: e.target.value }))}
              placeholder="Dejar vacío para mantener la actual"
            />
          </div>

          {formData.password && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repetir Nueva Contraseña
              </label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Repetir nueva contraseña"
              />
            </div>
          )}
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
        <select
          value={formData.isActive ? "active" : "inactive"}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, isActive: e.target.value === "active" }))}
          className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
        >
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notas Internas (opcional)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
          placeholder="Notas internas sobre el usuario..."
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : user ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}

