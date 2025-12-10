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
  console.log("  - user.role.name:", user?.role?.name || "N/A", "(id:", user?.role?.id || "N/A", ")");

  // role ahora es SIEMPRE un objeto { id, name }, extraer el nombre
  const userRoleName = user?.role?.name?.toLowerCase() as UserRole | null;

  // --- useEffect: Hidratar usuario al montar si no está presente ---
  useEffect(() => {
    if (!user) {
      console.log("🔵 ProtectedRoute: hydrating user...");
      useAuthStore.getState().hydrateUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- useEffect: Manejar redirecciones ---
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && userRoleName && !allowedRoles.includes(userRoleName)) {
      router.replace("/unauthorized");
      return;
    }
  }, [isAuthenticated, userRoleName, allowedRoles, router, redirectTo]);

  // --- Guard DESPUÉS del efecto: Permitir redirect sin bloquear ---
  if (!isAuthenticated) {
    router.replace(redirectTo);
    return null;
  }

  // Verificar que user existe antes de acceder a sus propiedades
  if (!user) {
    console.warn("⚠ ProtectedRoute sin user — evitando loading infinito");
    return null;
  }

  // Verificar organizationId
  if (!user.organizationId) {
    console.warn("⚠️ [ProtectedRoute] user.organizationId no está presente");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // role ahora es SIEMPRE un objeto { id, name }
  const roleName = user.role?.name?.toLowerCase();

  // Si no hay role pero hay user, permitir paso (el backend puede devolver role como null)
  // Solo bloquear si hay allowedRoles específicos
  if (allowedRoles && allowedRoles.length > 0 && !roleName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
