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
    permissions: string[]; // SIEMPRE presente como array (puede estar vacío si backend no envía)
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

/**
 * Normaliza un usuario del backend preservando explícitamente role.permissions
 * NO infiere permisos por role.name - solo preserva lo que viene del backend
 */
export function normalizeUser(rawUser: any): AuthUser | null {
  if (!rawUser) return null;

  const id = normalizeId(rawUser.id);
  const email = rawUser.email || "";
  const fullName = rawUser.fullName || rawUser.name || "";

  // Preservar permissions explícitas del backend
  let permissions: string[] = [];
  if (rawUser.role?.permissions && Array.isArray(rawUser.role.permissions)) {
    // Filtrar solo strings válidos
    permissions = rawUser.role.permissions.filter((p: any) => typeof p === "string" && p.length > 0);
  }
  // Si el backend no envía permissions, el array queda vacío (pero existe)

  const role = rawUser.role
    ? {
        id: normalizeId(rawUser.role.id),
        name: rawUser.role.name || "ADMINISTRATION",
        permissions, // SIEMPRE presente como array (preservado del backend o vacío)
      }
    : {
        id: "",
        name: "ADMINISTRATION",
        permissions: [], // Array vacío si no hay role
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

