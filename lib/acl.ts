/**
 * Sistema de Control de Acceso (ACL) para PMD
 * 
 * Permisos basados en módulos y acciones:
 * - works.read, works.create, works.update, works.delete, works.manage
 * - staff.read, staff.create, staff.update, staff.delete, staff.manage
 * - suppliers.read, suppliers.create, suppliers.update, suppliers.delete, suppliers.manage
 * - documents.read, documents.create, documents.update, documents.delete, documents.manage
 * - accounting.read, accounting.create, accounting.update, accounting.delete, accounting.manage
 * - cashbox.read, cashbox.create, cashbox.update, cashbox.delete, cashbox.manage
 * - clients.read, clients.create, clients.update, clients.delete, clients.manage
 * - alerts.read, alerts.create, alerts.update, alerts.delete, alerts.manage
 * - audit.read, audit.delete, audit.manage
 * - settings.read, settings.update, settings.manage
 * - users.read, users.create, users.update, users.delete, users.manage
 * - roles.read, roles.create, roles.update, roles.delete, roles.manage
 */

import { useAuthStore } from "@/store/authStore";

export type Permission = 
  | "works.read" | "works.create" | "works.update" | "works.delete" | "works.manage"
  | "staff.read" | "staff.create" | "staff.update" | "staff.delete" | "staff.manage"
  | "suppliers.read" | "suppliers.create" | "suppliers.update" | "suppliers.delete" | "suppliers.manage"
  | "documents.read" | "documents.create" | "documents.update" | "documents.delete" | "documents.manage"
  | "accounting.read" | "accounting.create" | "accounting.update" | "accounting.delete" | "accounting.manage"
  | "cashbox.read" | "cashbox.create" | "cashbox.update" | "cashbox.delete" | "cashbox.manage"
  | "clients.read" | "clients.create" | "clients.update" | "clients.delete" | "clients.manage"
  | "alerts.read" | "alerts.create" | "alerts.update" | "alerts.delete" | "alerts.manage"
  | "audit.read" | "audit.delete" | "audit.manage"
  | "settings.read" | "settings.update" | "settings.manage"
  | "users.read" | "users.create" | "users.update" | "users.delete" | "users.manage"
  | "roles.read" | "roles.create" | "roles.update" | "roles.delete" | "roles.manage";

/**
 * Obtiene los permisos del usuario desde su rol en el backend
 * @returns Array de permisos del usuario
 */
function getUserPermissions(): Permission[] {
  const user = useAuthStore.getState().user;
  
  if (!user) {
    return [];
  }

  // role ahora es SIEMPRE un objeto { id, name, permissions? }
  // Si el usuario tiene un rol con permisos explícitos
  if (user.role?.permissions && Array.isArray(user.role.permissions) && user.role.permissions.length > 0) {
    return user.role.permissions.filter((p: string): p is Permission => 
      typeof p === "string" && p.length > 0
    );
  }

  // Fallback: usar role.name para determinar permisos por defecto
  const roleName = user.role?.name?.toLowerCase() || "";
  
  // Permisos por defecto según rol básico
  if (roleName === "admin" || roleName === "administrator") {
    return [
      "works.read", "works.create", "works.update", "works.delete", "works.manage",
      "staff.read", "staff.create", "staff.update", "staff.delete", "staff.manage",
      "suppliers.read", "suppliers.create", "suppliers.update", "suppliers.delete", "suppliers.manage",
      "documents.read", "documents.create", "documents.update", "documents.delete", "documents.manage",
      "accounting.read", "accounting.create", "accounting.update", "accounting.delete", "accounting.manage",
      "cashbox.read", "cashbox.create", "cashbox.update", "cashbox.delete", "cashbox.manage",
      "clients.read", "clients.create", "clients.update", "clients.delete", "clients.manage",
      "alerts.read", "alerts.create", "alerts.update", "alerts.delete", "alerts.manage",
      "audit.read", "audit.delete", "audit.manage",
      "settings.read", "settings.update", "settings.manage",
      "users.read", "users.create", "users.update", "users.delete", "users.manage",
      "roles.read", "roles.create", "roles.update", "roles.delete", "roles.manage",
    ];
  }
  if (roleName === "operator" || roleName === "operador") {
    return [
      "works.read", "works.create", "works.update",
      "staff.read", "staff.create",
      "suppliers.read", "suppliers.create",
      "documents.read", "documents.create", "documents.update",
      "accounting.read", "accounting.create", "accounting.update",
      "cashbox.read", "cashbox.create",
      "clients.read", "clients.create",
      "alerts.read", "alerts.create", "alerts.update",
      "settings.read",
    ];
  }
  if (roleName === "auditor") {
    return [
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
    ];
  }

  return [];
}

/**
 * Hook para verificar permisos
 * @param permission - Permiso a verificar
 * @returns true si el usuario tiene el permiso, false en caso contrario
 */
export function useCan(permission: Permission): boolean {
  const permissions = getUserPermissions();
  return permissions.includes(permission);
}

/**
 * Función helper para verificar permisos fuera de componentes
 * @param permission - Permiso a verificar
 * @returns true si el usuario tiene el permiso, false en caso contrario
 */
export function can(permission: Permission): boolean {
  const permissions = getUserPermissions();
  return permissions.includes(permission);
}

