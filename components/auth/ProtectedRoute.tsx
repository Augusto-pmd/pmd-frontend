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
  // ============================================
  // TEMPORALMENTE DESACTIVADO - ACCESO LIBRE
  // Para reactivar: descomentar el código abajo
  // ============================================
  return <>{children}</>;

  /* ========== CÓDIGO ORIGINAL (COMENTADO) ==========
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role-based access
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }
  }, [isAuthenticated, user, allowedRoles, router, redirectTo]);

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // Check role access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return <>{children}</>;
  ========== FIN CÓDIGO ORIGINAL ========== */
}

