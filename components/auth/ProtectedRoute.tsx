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
  const storeState = useAuthStore.getState();
  const token = storeState.token;
  const { user, isAuthenticated } = useAuthStore((state) => ({
    user: state.user ? state.getUserSafe() : null,
    isAuthenticated: state.isAuthenticated,
  }));

  const router = useRouter();
  
  // role ahora es SIEMPRE un objeto { id, name } o null, extraer el nombre
  const userRoleName = user?.role?.name?.toLowerCase() as UserRole | null;

  // --- useEffect: Si hay token pero no user, llamar a loadMe() ---
  useEffect(() => {
    if (token && !user) {
      console.log("🔵 ProtectedRoute: token presente pero sin user, llamando loadMe()...");
      storeState.loadMe().catch((error) => {
        console.error("🔴 ProtectedRoute: Error en loadMe():", error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  // --- useEffect: Manejar redirecciones ---
  useEffect(() => {
    // Si no hay token → redirect a login
    if (!token) {
      router.replace(redirectTo);
      return;
    }

    // Si no está autenticado → redirect a login
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    // Si hay allowedRoles y el usuario no tiene un rol permitido → redirect a unauthorized
    if (allowedRoles && userRoleName && !allowedRoles.includes(userRoleName)) {
      router.replace("/unauthorized");
      return;
    }
  }, [token, isAuthenticated, userRoleName, allowedRoles, router, redirectTo]);

  // --- Guard: Si no hay token → redirect inmediato ---
  if (!token) {
    router.replace(redirectTo);
    return null;
  }

  // --- Guard: Si no está autenticado → redirect ---
  if (!isAuthenticated) {
    router.replace(redirectTo);
    return null;
  }

  // --- Guard: Si hay token pero no user → mostrar loading mientras carga ---
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
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
