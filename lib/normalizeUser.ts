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

export function normalizeUser(rawUser: any): AuthUser {
  // Backend estabilizado siempre devuelve role como objeto { id, name } o null
  let normalizedRole: { id: string; name: string; permissions?: string[] } | null = null;
  let roleId: string | null = null;

  if (rawUser.role && typeof rawUser.role === "object") {
    normalizedRole = {
      id: normalizeId(rawUser.role.id ?? ""),
      name: String(rawUser.role.name || ""),
      permissions: rawUser.role.permissions,
    };
    roleId = normalizedRole.id;
  } else if (rawUser.roleId) {
    roleId = normalizeId(rawUser.roleId);
  }

  // Organization puede ser null
  let organization: { id: string; name: string; [key: string]: any } | null = null;
  let organizationId: string | null = null;

  if (rawUser.organization && typeof rawUser.organization === "object") {
    organization = {
      ...rawUser.organization,
      id: normalizeId(rawUser.organization.id ?? ""),
      name: String(rawUser.organization.name || ""),
    };
    organizationId = organization.id;
  } else if (rawUser.organizationId) {
    organizationId = normalizeId(rawUser.organizationId);
  }

  const normalizedUser: AuthUser = {
    id: normalizeId(rawUser.id),
    email: String(rawUser.email ?? ""),
    fullName: String(rawUser.fullName ?? rawUser.name ?? ""),
    isActive: rawUser.isActive ?? rawUser.is_active ?? undefined,
    role: normalizedRole,
    roleId,
    organizationId,
    organization,
    created_at: rawUser.created_at ?? rawUser.createdAt ?? undefined,
    updated_at: rawUser.updated_at ?? rawUser.updatedAt ?? undefined,
  };

  return normalizedUser;
}

