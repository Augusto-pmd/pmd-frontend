import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, token, refreshToken, isAuthenticated, logout, loadMe } = useAuthStore();

  // *** Normalización global del usuario ***
  let normalizedUser = user;

  if (normalizedUser?.role && typeof normalizedUser.role === "object") {
    normalizedUser = {
      ...normalizedUser,
      role: normalizedUser.role.name,
    };
  }

  return {
    user: normalizedUser,
    token,
    refreshToken,
    isAuthenticated,
    logout,
    loadMe,
  };
}
