export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string; // SIEMPRE string
}

export function normalizeUser(rawUser: any): AuthUser {
  if (!rawUser) {
    throw new Error("normalizeUser: rawUser is required");
  }

  const role =
    typeof rawUser.role === "object"
      ? rawUser.role?.name
      : rawUser.role ?? "operator"; // valor por defecto razonable

  return {
    id: String(rawUser.id),
    email: String(rawUser.email ?? ""),
    fullName: String(rawUser.fullName ?? rawUser.name ?? ""),
    role: String(role),
  };
}

