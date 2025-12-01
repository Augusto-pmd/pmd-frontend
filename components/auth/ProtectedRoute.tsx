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
  // Sincronización reactiva 100% con Zustand - elimina race conditions
  const { user, isAuthenticated } = useAuthStore((state) => ({
    user: state.user ? state.getUserSafe() : null,
    isAuthenticated: state.isAuthenticated,
  }));
  const router = useRouter();

  const userRole = user?.role ?? null;

  // Guard: NO renderizar nada hasta que user esté normalizado
  if (user === null || typeof user.role === "object") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

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

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // Check role access
  if (allowedRoles && userRole && !allowedRoles.includes(userRole as UserRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}

