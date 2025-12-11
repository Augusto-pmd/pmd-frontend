import { normalizeId } from "./normalizeId";

/**
 * Modelo unificado de usuario que coincide con la respuesta del backend
 * TODOS los IDs son SIEMPRE strings (normalizados)
 */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isActive?: boolean;
  role: {
    id: string;
    name: string;
    permissions?: string[];
  } | null;
  roleId: string | null;
  organizationId: string | null;
  organization: {
    id: string;
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
  const rawOrganizationId =
    rawUser.organizationId ||
    rawUser.organization?.id ||
    (rawUser.organizationId === null || rawUser.organization?.id === null ? null : DEFAULT_ORG_ID);

  // Normalizar organization: puede ser null, objeto, o necesitar creación
  // TODOS los IDs deben ser strings
  let organization: { id: string; name: string; [key: string]: any } | null = null;
  
  if (rawUser.organization && typeof rawUser.organization === "object") {
    // Organization existe como objeto
    organization = {
      ...rawUser.organization,
      id: normalizeId(rawUser.organization.id ?? rawOrganizationId ?? DEFAULT_ORG_ID),
      name: rawUser.organization.name || "PMD Arquitectura",
    };
  } else if (rawOrganizationId && rawOrganizationId !== DEFAULT_ORG_ID) {
    // Tenemos organizationId válido pero no objeto, crear uno básico
    organization = {
      id: normalizeId(rawOrganizationId),
      name: rawUser.organization?.name || "PMD Arquitectura",
    };
  } else if (rawOrganizationId === DEFAULT_ORG_ID) {
    // Usando fallback DEFAULT_ORG_ID, crear organización por defecto
    organization = {
      id: normalizeId(DEFAULT_ORG_ID),
      name: "PMD Arquitectura",
    };
  }
  // Si organizationId es null y no hay organization, organization queda null
  
  // organizationId final (normalizado a string)
  const organizationId = rawOrganizationId ? normalizeId(rawOrganizationId) : null;

  // Normalizar el rol: el backend puede devolver role como objeto { id, name } o null
  // Convertir SIEMPRE a objeto { id, name } o null (nunca string)
  // TODOS los IDs deben ser strings
  let normalizedRole: { id: string; name: string; permissions?: string[] } | null;
  let roleId: string | null;

  if (rawUser.role && typeof rawUser.role === "object") {
    // El rol viene como objeto { id, name, permissions? } - FORMATO CORRECTO
    normalizedRole = {
      id: normalizeId(rawUser.role.id ?? rawUser.roleId ?? ""),
      name: String(rawUser.role.name || rawUser.role.nombre || ""),
      permissions: rawUser.role.permissions,
    };
    // roleId SIEMPRE debe ser igual a role.id (y ambos son strings)
    roleId = normalizedRole.id;
  } else if (rawUser.role && typeof rawUser.role === "string") {
    // FALLBACK LEGACY: si viene como string, crear objeto (no debería pasar en producción)
    console.warn("⚠️ [normalizeUser] role viene como string (legacy), convirtiendo a objeto:", rawUser.role);
    const roleIdNormalized = normalizeId(rawUser.roleId ?? rawUser.role);
    normalizedRole = {
      id: roleIdNormalized,
      name: String(rawUser.role),
    };
    roleId = roleIdNormalized;
  } else {
    // Sin rol - null (el backend puede devolver null)
    normalizedRole = null;
    roleId = rawUser.roleId ? normalizeId(rawUser.roleId) : null;
  }

  const normalizedUser: AuthUser = {
    id: normalizeId(rawUser.id),
    email: String(rawUser.email ?? ""),
    fullName: String(rawUser.fullName ?? rawUser.name ?? ""),
    isActive: rawUser.isActive ?? rawUser.is_active ?? undefined,
    role: normalizedRole, // objeto { id: string, name } o null
    roleId, // string | null
    organizationId: organizationId ? normalizeId(organizationId) : null, // string | null (siempre normalizado)
    organization: organization ? { ...organization, id: normalizeId(organization.id) } : null, // objeto { id: string, name } o null (siempre normalizado)
    created_at: rawUser.created_at ?? rawUser.createdAt ?? undefined,
    updated_at: rawUser.updated_at ?? rawUser.updatedAt ?? undefined,
  };

  // Validar que organizationId esté presente (solo warning, no throw)
  if (!normalizedUser.organizationId || normalizedUser.organizationId === DEFAULT_ORG_ID) {
    console.warn("⚠️ [normalizeUser] organizationId no encontrado en rawUser, usando DEFAULT_ORG_ID:", rawUser);
  }

  return normalizedUser;
}

