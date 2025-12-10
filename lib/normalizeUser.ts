/**
 * Modelo unificado de usuario que coincide con la respuesta del backend
 * El backend SIEMPRE devuelve:
 * - role: { id: number; name: string }
 * - roleId: number
 * - organizationId: number
 * - organization: { id: number; name: string }
 */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: {
    id: string | number;
    name: string;
    permissions?: string[];
  };
  roleId: string | number;
  organizationId: string | number;
  organization: {
    id: string | number;
    name: string;
    [key: string]: any;
  };
}

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export function normalizeUser(rawUser: any): AuthUser {
  // Extraer organizationId en este orden:
  // 1) rawUser.organizationId (preferred)
  // 2) rawUser.organization?.id (fallback)
  // 3) DEFAULT_ORG_ID (ultimate fallback)
  const organizationId =
    rawUser.organizationId ||
    rawUser.organization?.id ||
    DEFAULT_ORG_ID;

  // Si no hay organization object y usamos DEFAULT_ORG_ID, crear uno
  let organization = rawUser.organization;
  if (!organization && organizationId === DEFAULT_ORG_ID) {
    organization = {
      id: DEFAULT_ORG_ID,
      name: "PMD Arquitectura",
    };
  } else if (organization && !organization.id) {
    // Asegurar que organization.id esté presente
    organization = {
      ...organization,
      id: organizationId,
    };
  } else if (!organization) {
    // Si organization es null/undefined pero tenemos organizationId, crear objeto básico
    organization = {
      id: organizationId,
      name: rawUser.organization?.name || "PMD Arquitectura",
    };
  }

  // Normalizar el rol: el backend SIEMPRE devuelve role como objeto { id, name }
  // Mantener role como objeto, nunca como string
  let normalizedRole: { id: string | number; name: string; permissions?: string[] };
  let roleId: string | number;

  if (rawUser.role && typeof rawUser.role === "object") {
    // El rol viene como objeto { id, name, permissions? } - FORMATO CORRECTO
    normalizedRole = {
      id: rawUser.role.id ?? rawUser.roleId ?? "",
      name: String(rawUser.role.name || rawUser.role.nombre || ""),
      permissions: rawUser.role.permissions,
    };
    roleId = rawUser.role.id ?? rawUser.roleId ?? "";
  } else if (rawUser.role && typeof rawUser.role === "string") {
    // FALLBACK LEGACY: si viene como string, crear objeto (no debería pasar en producción)
    // El backend SIEMPRE devuelve role como objeto { id, name }
    // Este caso solo existe para compatibilidad con datos antiguos
    console.warn("⚠️ [normalizeUser] role viene como string (legacy), convirtiendo a objeto:", rawUser.role);
    normalizedRole = {
      id: rawUser.roleId ?? rawUser.role,
      name: String(rawUser.role),
    };
    roleId = rawUser.roleId ?? rawUser.role;
  } else {
    // Sin rol - crear objeto vacío (no debería pasar en producción)
    console.warn("⚠️ [normalizeUser] role no encontrado, usando fallback");
    normalizedRole = {
      id: rawUser.roleId ?? "",
      name: "",
    };
    roleId = rawUser.roleId ?? "";
  }

  const normalizedUser: AuthUser = {
    id: String(rawUser.id),
    email: String(rawUser.email ?? ""),
    fullName: String(rawUser.fullName ?? rawUser.name ?? ""),
    role: normalizedRole, // SIEMPRE objeto { id, name }
    roleId, // SIEMPRE presente
    organizationId, // SIEMPRE presente (con fallback)
    organization, // SIEMPRE presente (con fallback)
  };

  // Validar que organizationId esté presente (solo warning, no throw)
  if (!normalizedUser.organizationId || normalizedUser.organizationId === DEFAULT_ORG_ID) {
    console.warn("⚠️ [normalizeUser] organizationId no encontrado en rawUser, usando DEFAULT_ORG_ID:", rawUser);
  }

  return normalizedUser;
}

