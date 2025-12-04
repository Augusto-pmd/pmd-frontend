"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";
import { Loading } from "@/components/ui/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {

  // --- HOOKS SIEMPRE PRIMERO ---
  const { user, isAuthenticated } = useAuthStore((state) => ({
    user: state.user ? state.getUserSafe() : null,
    isAuthenticated: state.isAuthenticated,
  }));

  const router = useRouter();
  
  // Logs de depuración
  const storeState = useAuthStore.getState();
  console.log("🔵 [AUTH PROTECTED ROUTE] Estado del store:");
  console.log("  - isAuthenticated:", isAuthenticated);
  console.log("  - user:", user ? "PRESENT" : "NULL");
  console.log("  - token:", storeState.token ? "***PRESENT***" : "NULL");
  console.log("  - user.role:", user?.role, "(type:", typeof user?.role, ")");

  const userRole = user?.role ?? null;

  // --- useEffect: NO debe haber returns antes ---
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole as UserRole)) {
      router.replace("/unauthorized");
      return;
    }
  }, [isAuthenticated, userRole, allowedRoles, router, redirectTo]);

  // --- Guard DESPUÉS del efecto ---
  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // Si user.role es objeto, tomar el nombre del rol o permitir paso
  const role = typeof user.role === "object" 
    ? (user.role.name ?? user.role.id ?? null) 
    : user.role;

  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
