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

import { useMemo } from "react";
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
 * Obtiene los permisos del usuario desde su rol
 * El frontend NUNCA depende de role.name para permisos
 * Los permisos SIEMPRE vienen en user.role.permissions (inyectados por normalizadores)
 * @returns Array de permisos del usuario
 */
function getUserPermissions(): Permission[] {
  const user = useAuthStore.getState().user;
  
  console.log("🟡 [ACL AUDIT] getUserPermissions() llamado");
  console.log("🟡 [ACL AUDIT] user existe?", !!user);
  
  if (!user) {
    console.error("🟡 [ACL AUDIT] ❌ FAIL: user no existe");
    return [];
  }

  // VALIDACIÓN 1: user.role existe
  if (!user.role) {
    console.error("🟡 [ACL AUDIT] ❌ FAIL: user.role no existe");
    return [];
  }
  console.log("🟡 [ACL AUDIT] ✅ PASS: user.role existe");

  // VALIDACIÓN 2: user.role.permissions existe
  if (!user.role.permissions) {
    console.error("🟡 [ACL AUDIT] ❌ FAIL: user.role.permissions no existe");
    return [];
  }
  console.log("🟡 [ACL AUDIT] ✅ PASS: user.role.permissions existe");

  // VALIDACIÓN 3: user.role.permissions es Array
  if (!Array.isArray(user.role.permissions)) {
    console.error("🟡 [ACL AUDIT] ❌ FAIL: user.role.permissions no es Array. Tipo:", typeof user.role.permissions);
    return [];
  }
  console.log("🟡 [ACL AUDIT] ✅ PASS: user.role.permissions es Array");

  // VALIDACIÓN 4: user.role.permissions no es vacío
  if (user.role.permissions.length === 0) {
    console.error("🟡 [ACL AUDIT] ❌ FAIL: user.role.permissions está vacío (length: 0)");
    return [];
  }
  console.log("🟡 [ACL AUDIT] ✅ PASS: user.role.permissions no está vacío (length:", user.role.permissions.length, ")");

  // Filtrar solo strings válidos
  const permissions = user.role.permissions.filter((p: string): p is Permission => 
    typeof p === "string" && p.length > 0
  );

  if (permissions.length === 0) {
    console.error("🟡 [ACL AUDIT] ❌ FAIL: No hay permisos válidos después del filtro");
    return [];
  }

  console.log("🟡 [ACL AUDIT] ✅ PASS: Using explicit permissions from backend");
  console.log("🟡 [ACL AUDIT] Permisos explícitos:", permissions.length, "permisos válidos");
  console.log("🟡 [ACL AUDIT] Lista de permisos:", permissions);
  
  return permissions;
}

/**
 * Hook para verificar permisos
 * @param permission - Permiso a verificar
 * @returns true si el usuario tiene el permiso, false en caso contrario
 */
export function useCan(permission: Permission): boolean {
  // 🔍 HACER REACTIVO: Usar selector reactivo en lugar de getState()
  const user = useAuthStore((state) => state.user);
  
  // Obtener permisos de forma reactiva
  const permissions: Permission[] = useMemo(() => {
    if (!user?.role?.permissions) {
      return [];
    }
    
    if (!Array.isArray(user.role.permissions)) {
      return [];
    }
    
    // Filtrar solo strings válidos
    return user.role.permissions.filter((p: string): p is Permission => 
      typeof p === "string" && p.length > 0
    );
  }, [user?.role?.permissions]);
  
  // 🔍 LOGS TEMPORALES PARA DEBUGGING
  console.log("[ACL] checking permission:", permission);
  console.log("[ACL] available permissions:", permissions);
  console.log("[ACL] permissions length:", permissions.length);
  console.log("[ACL] permission type:", typeof permission);
  if (permissions.length > 0) {
    console.log("[ACL] permissions types:", permissions.map(p => typeof p));
    console.log("[ACL] permissions sample:", permissions.slice(0, 5));
  }
  
  // Verificar coincidencia exacta (case-sensitive)
  const hasPermission = permissions.includes(permission);
  
  // Si no hay coincidencia, verificar si hay problemas de formato
  if (!hasPermission && permissions.length > 0) {
    const lowerPermission = permission.toLowerCase();
    const lowerPermissions = permissions.map(p => String(p).toLowerCase());
    const hasLowerMatch = lowerPermissions.includes(lowerPermission);
    
    console.log("[ACL] ❌ No match found for:", permission);
    console.log("[ACL] Checking lowercase match:", hasLowerMatch);
    if (hasLowerMatch) {
      const matchingPermission = permissions.find(p => String(p).toLowerCase() === lowerPermission);
      console.log("[ACL] ⚠️ Found lowercase match:", matchingPermission, "vs requested:", permission);
    }
    
    // Verificar si hay permisos similares
    const similarPermissions = permissions.filter(p => 
      String(p).toLowerCase().includes(permission.split('.')[0].toLowerCase())
    );
    if (similarPermissions.length > 0) {
      console.log("[ACL] Similar permissions found:", similarPermissions);
    }
  }
  
  console.log(`[ACL] useCan("${permission}"): ${hasPermission ? "✅ TRUE" : "❌ FALSE"}`);
  
  return hasPermission;
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

