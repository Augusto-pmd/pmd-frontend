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
  const user = useAuthStore.getState().getUserSafe();
  
  if (!user) {
    return [];
  }

  // Si el usuario tiene un rol con permisos (objeto role con permissions)
  if (user.role && typeof user.role === "object" && "permissions" in user.role) {
    const rolePermissions = (user.role as any).permissions;
    if (Array.isArray(rolePermissions) && rolePermissions.length > 0) {
      return rolePermissions.filter((p: string): p is Permission => 
        typeof p === "string" && p.length > 0
      );
    }
  }

  // Si el usuario tiene roleId, intentar obtener permisos desde roles store
  // Nota: El ACL se actualizará cuando el usuario recargue la página o cuando
  // se actualice el store de roles. Para actualización inmediata, el usuario
  // debe hacer logout/login después de cambiar de rol.
  if (user.roleId) {
    // Los permisos se obtendrán del backend cuando el usuario haga login
    // o cuando se actualice la sesión. Por ahora, usamos el fallback.
    // En producción, el backend debería devolver los permisos en el objeto user.role
  }

  // Fallback: si el rol es un string simple (admin, operator, auditor)
  if (typeof user.role === "string") {
    const roleName = user.role.toLowerCase();
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

