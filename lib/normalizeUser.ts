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
  };
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

export function normalizeUser(rawUser: any): AuthUser | null {
  if (!rawUser) return null;

  const id = normalizeId(rawUser.id);
  const email = rawUser.email || "";
  const fullName = rawUser.fullName || rawUser.name || "";

  const role = rawUser.role
    ? {
        id: normalizeId(rawUser.role.id),
        name: rawUser.role.name || "ADMINISTRATION",
      }
    : {
        id: "",
        name: "ADMINISTRATION",
      };

  let organization: { id: string; name: string; [key: string]: any } | null = null;
  let organizationId: string = "";

  if (rawUser.organization) {
    organization = {
      id: normalizeId(rawUser.organization.id),
      name: rawUser.organization.name || "",
    };
    organizationId = organization.id;
  } else if (rawUser.organizationId) {
    organizationId = normalizeId(rawUser.organizationId);
  }

  return {
    id,
    email,
    fullName,
    role,
    roleId: normalizeId(rawUser.roleId || role.id),
    organization,
    organizationId: organizationId || null,
    isActive: rawUser.isActive ?? true,
    created_at: rawUser.created_at ?? rawUser.createdAt ?? undefined,
    updated_at: rawUser.updated_at ?? rawUser.updatedAt ?? undefined,
  };
}

