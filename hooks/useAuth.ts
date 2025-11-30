import { useAuthStore, UserRole } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  // Normalize user role to string
  const userRole = user?.role ? (typeof user.role === 'object' ? user.role.name : user.role) : null;

  const checkRole = (allowedRoles: UserRole[]) => {
    if (!userRole || !allowedRoles.includes(userRole as UserRole)) {
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

