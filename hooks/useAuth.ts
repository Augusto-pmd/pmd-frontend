import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const getUserSafe = useAuthStore((s) => s.getUserSafe);
  const user = getUserSafe();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const loadMe = useAuthStore((s) => s.loadMe);

  return { user, isAuthenticated, logout, loadMe };
}
