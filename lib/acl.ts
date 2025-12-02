/**
 * Sistema de Control de Acceso (ACL) para PMD
 * 
 * Permisos basados en módulos y acciones:
 * - works.read, works.create, works.update, works.delete
 * - staff.read, staff.manage
 * - documents.read, documents.create, documents.update, documents.delete
 * - accounting.read, accounting.create, accounting.update, accounting.delete
 * - alerts.read, alerts.create, alerts.update, alerts.delete
 * - audit.read, audit.delete
 * - settings.read, settings.update
 */

import { useAuthStore, UserRole } from "@/store/authStore";

export type Permission = 
  | "works.read" | "works.create" | "works.update" | "works.delete" | "works.manage"
  | "staff.read" | "staff.create" | "staff.manage"
  | "suppliers.read" | "suppliers.create" | "suppliers.manage"
  | "documents.read" | "documents.create" | "documents.update" | "documents.delete" | "documents.manage"
  | "accounting.read" | "accounting.create" | "accounting.update" | "accounting.delete" | "accounting.manage"
  | "cashbox.read" | "cashbox.create" | "cashbox.manage"
  | "clients.read" | "clients.create" | "clients.manage"
  | "alerts.read" | "alerts.create" | "alerts.update" | "alerts.delete" | "alerts.manage"
  | "audit.read" | "audit.delete" | "audit.manage"
  | "settings.read" | "settings.update" | "settings.manage";

// Mapeo de roles a permisos
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    // Acceso total
    "works.read", "works.create", "works.update", "works.delete", "works.manage",
    "staff.read", "staff.create", "staff.manage",
    "suppliers.read", "suppliers.create", "suppliers.manage",
    "documents.read", "documents.create", "documents.update", "documents.delete", "documents.manage",
    "accounting.read", "accounting.create", "accounting.update", "accounting.delete", "accounting.manage",
    "cashbox.read", "cashbox.create", "cashbox.manage",
    "clients.read", "clients.create", "clients.manage",
    "alerts.read", "alerts.create", "alerts.update", "alerts.delete", "alerts.manage",
    "audit.read", "audit.delete", "audit.manage",
    "settings.read", "settings.update", "settings.manage",
  ],
  operator: [
    // Operador: puede leer y crear, pero no eliminar
    "works.read", "works.create", "works.update",
    "staff.read", "staff.create",
    "suppliers.read", "suppliers.create",
    "documents.read", "documents.create", "documents.update",
    "accounting.read", "accounting.create", "accounting.update",
    "cashbox.read", "cashbox.create",
    "clients.read", "clients.create",
    "alerts.read", "alerts.create", "alerts.update",
    "settings.read",
  ],
  auditor: [
    // Auditor: solo lectura
    "works.read",
    "staff.read",
    "suppliers.read",
    "documents.read",
    "accounting.read",
    "cashbox.read",
    "clients.read",
    "alerts.read",
    "audit.read",
    "settings.read",
  ],
};

/**
 * Hook para verificar permisos
 * @param permission - Permiso a verificar
 * @returns true si el usuario tiene el permiso, false en caso contrario
 */
export function useCan(permission: Permission): boolean {
  const user = useAuthStore.getState().getUserSafe();
  
  if (!user || !user.role) {
    return false;
  }

  const userRole = user.role as UserRole;
  const permissions = rolePermissions[userRole] || [];
  
  return permissions.includes(permission);
}

/**
 * Función helper para verificar permisos fuera de componentes
 * @param permission - Permiso a verificar
 * @returns true si el usuario tiene el permiso, false en caso contrario
 */
export function can(permission: Permission): boolean {
  const user = useAuthStore.getState().getUserSafe();
  
  if (!user || !user.role) {
    return false;
  }

  const userRole = user.role as UserRole;
  const permissions = rolePermissions[userRole] || [];
  
  return permissions.includes(permission);
}

