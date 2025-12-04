export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string | { id: string; name: string; permissions?: string[] }; // Puede ser string o objeto con permisos
  roleId?: string; // ID del rol si está disponible
  organizationId?: string;
  organization?: {
    id?: string;
    [key: string]: any;
  };
}

export function normalizeUser(rawUser: any): AuthUser {
  const organizationId =
    rawUser.organizationId ||
    rawUser.organization?.id ||
    null;

  // Normalizar el rol: puede venir como objeto con permisos o como string/ID
  let normalizedRole: string | { id: string; name: string; permissions?: string[] };
  let roleId: string | undefined;

  if (rawUser.role && typeof rawUser.role === "object") {
    // El rol viene como objeto (con permisos)
    normalizedRole = {
      id: String(rawUser.role.id || rawUser.roleId || ""),
      name: String(rawUser.role.name || rawUser.role.nombre || ""),
      permissions: Array.isArray(rawUser.role.permissions) ? rawUser.role.permissions : undefined,
    };
    roleId = String(rawUser.role.id || rawUser.roleId || "");
  } else {
    // El rol viene como string o ID
    normalizedRole = String(rawUser.role ?? rawUser.roleId ?? "");
    roleId = rawUser.roleId ? String(rawUser.roleId) : undefined;
  }

  const normalizedUser: AuthUser = {
    id: String(rawUser.id),
    email: String(rawUser.email ?? ""),
    fullName: String(rawUser.fullName ?? rawUser.name ?? ""),
    role: normalizedRole,
    roleId,
    organizationId,
    organization: rawUser.organization ?? null
  };

  // Console.log temporal para validar
  console.log("Auth user loaded:", normalizedUser);

  return normalizedUser;
}

