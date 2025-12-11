/**
 * Modelo unificado de usuario que coincide con la respuesta del backend
 * El backend puede devolver:
 * - role: { id: number; name: string } | null
 * - roleId: number | null
 * - organizationId: number | null
 * - organization: { id: number; name: string } | null
 */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isActive?: boolean;
  role: {
    id: string | number;
    name: string;
    permissions?: string[];
  } | null;
  roleId: string | number | null;
  organizationId: string | number | null;
  organization: {
    id: string | number;
    name: string;
    [key: string]: any;
  } | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export function normalizeUser(rawUser: any): AuthUser {
  // Extraer organizationId en este orden:
  // 1) rawUser.organizationId (preferred)
  // 2) rawUser.organization?.id (fallback)
  // 3) DEFAULT_ORG_ID (ultimate fallback solo si no hay nada)
  const organizationId =
    rawUser.organizationId ||
    rawUser.organization?.id ||
    (rawUser.organizationId === null || rawUser.organization?.id === null ? null : DEFAULT_ORG_ID);

  // Normalizar organization: puede ser null, objeto, o necesitar creación
  let organization: { id: string | number; name: string; [key: string]: any } | null = null;
  
  if (rawUser.organization && typeof rawUser.organization === "object") {
    // Organization existe como objeto
    organization = {
      ...rawUser.organization,
      id: rawUser.organization.id ?? organizationId ?? DEFAULT_ORG_ID,
      name: rawUser.organization.name || "PMD Arquitectura",
    };
  } else if (organizationId && organizationId !== DEFAULT_ORG_ID) {
    // Tenemos organizationId válido pero no objeto, crear uno básico
    organization = {
      id: organizationId,
      name: rawUser.organization?.name || "PMD Arquitectura",
    };
  } else if (organizationId === DEFAULT_ORG_ID) {
    // Usando fallback DEFAULT_ORG_ID, crear organización por defecto
    organization = {
      id: DEFAULT_ORG_ID,
      name: "PMD Arquitectura",
    };
  }
  // Si organizationId es null y no hay organization, organization queda null

  // Normalizar el rol: el backend puede devolver role como objeto { id, name } o null
  // Convertir SIEMPRE a objeto { id, name } o null (nunca string)
  let normalizedRole: { id: string | number; name: string; permissions?: string[] } | null;
  let roleId: string | number | null;

  if (rawUser.role && typeof rawUser.role === "object") {
    // El rol viene como objeto { id, name, permissions? } - FORMATO CORRECTO
    normalizedRole = {
      id: rawUser.role.id ?? rawUser.roleId ?? "",
      name: String(rawUser.role.name || rawUser.role.nombre || ""),
      permissions: rawUser.role.permissions,
    };
    // roleId SIEMPRE debe ser igual a role.id
    roleId = normalizedRole.id;
  } else if (rawUser.role && typeof rawUser.role === "string") {
    // FALLBACK LEGACY: si viene como string, crear objeto (no debería pasar en producción)
    console.warn("⚠️ [normalizeUser] role viene como string (legacy), convirtiendo a objeto:", rawUser.role);
    normalizedRole = {
      id: rawUser.roleId ?? rawUser.role,
      name: String(rawUser.role),
    };
    roleId = rawUser.roleId ?? rawUser.role;
  } else {
    // Sin rol - null (el backend puede devolver null)
    normalizedRole = null;
    roleId = rawUser.roleId ?? null;
  }

  const normalizedUser: AuthUser = {
    id: String(rawUser.id),
    email: String(rawUser.email ?? ""),
    fullName: String(rawUser.fullName ?? rawUser.name ?? ""),
    isActive: rawUser.isActive ?? rawUser.is_active ?? undefined,
    role: normalizedRole, // objeto { id, name } o null
    roleId, // string | number | null
    organizationId: organizationId || null, // string | number | null (con fallback a DEFAULT_ORG_ID si es necesario)
    organization: organization || null, // objeto { id, name } o null
    created_at: rawUser.created_at ?? rawUser.createdAt ?? undefined,
    updated_at: rawUser.updated_at ?? rawUser.updatedAt ?? undefined,
  };

  // Validar que organizationId esté presente (solo warning, no throw)
  if (!normalizedUser.organizationId || normalizedUser.organizationId === DEFAULT_ORG_ID) {
    console.warn("⚠️ [normalizeUser] organizationId no encontrado en rawUser, usando DEFAULT_ORG_ID:", rawUser);
  }

  return normalizedUser;
}

