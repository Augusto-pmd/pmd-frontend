export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string | { id: string; name: string; permissions?: string[] }; // Puede ser string o objeto con permisos
  roleId?: string; // ID del rol si está disponible
  organizationId: string; // SIEMPRE requerido (con fallback a DEFAULT_ORG_ID)
  organization: {
    id: string;
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

  // Normalizar el rol: el backend ahora devuelve role como string
  // Pero mantenemos compatibilidad con objetos por si acaso
  let normalizedRole: string | { id: string; name: string; permissions?: string[] };
  let roleId: string | undefined;

  if (rawUser.role && typeof rawUser.role === "object") {
    // El rol viene como objeto (compatibilidad con versiones anteriores)
    normalizedRole = {
      id: String(rawUser.role.id || rawUser.roleId || ""),
      name: String(rawUser.role.name || rawUser.role.nombre || ""),
      permissions: Array.isArray(rawUser.role.permissions) ? rawUser.role.permissions : undefined,
    };
    roleId = String(rawUser.role.id || rawUser.roleId || "");
  } else {
    // El rol viene como string (formato actual del backend)
    normalizedRole = String(rawUser.role ?? rawUser.roleId ?? "");
    roleId = rawUser.roleId ? String(rawUser.roleId) : undefined;
  }

  const normalizedUser: AuthUser = {
    id: String(rawUser.id),
    email: String(rawUser.email ?? ""),
    fullName: String(rawUser.fullName ?? rawUser.name ?? ""),
    role: normalizedRole,
    roleId,
    organizationId, // SIEMPRE presente (con fallback)
    organization, // SIEMPRE presente (con fallback)
  };

  // Validar que organizationId esté presente (solo warning, no throw)
  if (!normalizedUser.organizationId || normalizedUser.organizationId === DEFAULT_ORG_ID) {
    console.warn("⚠️ [normalizeUser] organizationId no encontrado en rawUser, usando DEFAULT_ORG_ID:", rawUser);
  }

  return normalizedUser;
}

