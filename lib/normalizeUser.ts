export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string; // SIEMPRE string
  organizationId?: string;
  organization?: {
    id?: string;
    [key: string]: any;
  };
}

export function normalizeUser(rawUser: any): AuthUser {
  if (!rawUser) {
    throw new Error("normalizeUser: rawUser is required");
  }

  const role =
    typeof rawUser.role === "object"
      ? rawUser.role?.name
      : rawUser.role ?? "operator"; // valor por defecto razonable

  // Preservar organizationId de múltiples fuentes posibles
  const organizationId =
    rawUser.organizationId ||
    rawUser.organization?.id ||
    null;

  const normalizedUser: AuthUser = {
    id: String(rawUser.id),
    email: String(rawUser.email ?? ""),
    fullName: String(rawUser.fullName ?? rawUser.name ?? ""),
    role: String(role),
    organizationId: organizationId ? String(organizationId) : undefined,
    organization: rawUser.organization ?? undefined,
  };

  // Validar que organizationId esté presente si viene del backend
  if (organizationId) {
    console.log("✅ [normalizeUser] organizationId preservado:", organizationId);
  } else {
    console.warn("⚠️ [normalizeUser] organizationId no encontrado en rawUser");
  }

  return normalizedUser;
}

