import { useAuthStore, UserRole } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const checkRole = (allowedRoles: UserRole[]) => {
    if (!user || !allowedRoles.includes(user.role)) {
      return false;
    }
    return true;
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return false;
    }
    return true;
  };

  const requireRole = (allowedRoles: UserRole[]) => {
    if (!requireAuth()) return false;
    if (!checkRole(allowedRoles)) {
      router.push("/dashboard");
      return false;
    }
    return true;
  };

  return {
    user,
    isAuthenticated,
    logout,
    checkRole,
    requireAuth,
    requireRole,
  };
}

